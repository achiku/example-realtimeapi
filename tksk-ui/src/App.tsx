import { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle,
  Check,
  Clock,
  FileText,
  Filter,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User
} from 'lucide-react';

// ダミーデータ
const initialDebtors = [
  { id: 1, name: '株式会社山田商事', amount: 250000, dueDate: '2025-03-15', status: '未払い', lastContact: '2025-02-10', contactMethod: 'メール', notes: '3/5に支払い予定と連絡あり', priority: '中' },
  { id: 2, name: '鈴木電機株式会社', amount: 780000, dueDate: '2025-02-20', status: '遅延', lastContact: '2025-02-15', contactMethod: '電話', notes: '担当者不在で後日連絡予定', priority: '高' },
  { id: 3, name: '田中工業', amount: 150000, dueDate: '2025-04-05', status: '未払い', lastContact: '2025-02-12', contactMethod: 'メール', notes: '', priority: '低' },
  { id: 4, name: '佐藤建設株式会社', amount: 1250000, dueDate: '2025-01-30', status: '遅延', lastContact: '2025-02-18', contactMethod: '訪問', notes: '資金繰り改善後に支払い予定', priority: '高' },
  { id: 5, name: '中村物産', amount: 320000, dueDate: '2025-03-25', status: '未払い', lastContact: '2025-02-05', contactMethod: 'メール', notes: '', priority: '中' },
];

const DebtCollectionApp = () => {
  const [debtors, setDebtors] = useState(initialDebtors);
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [filter, setFilter] = useState('全て');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newContactLog, setNewContactLog] = useState('');
  const [newDebtor, setNewDebtor] = useState({
    name: '',
    amount: '',
    dueDate: '',
    status: '未払い',
    lastContact: '',
    contactMethod: 'メール',
    notes: '',
    priority: '中'
  });

 
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);


  const startSession = async () => {
    let EPHEMERAL_KEY = '';
    // Get an ephemeral key from the Fastify server
    try {
      const tokenResponse = await fetch("http://localhost:3001/token");
      if (!tokenResponse.ok) {
        throw new Error(`HTTP error! status: ${tokenResponse.status}`);
      }
      const data = await tokenResponse.json();
      EPHEMERAL_KEY = data.client_secret.value;
      console.log(data);
    } catch (error) {
      console.error("Failed to fetch token:", error);
      return;
    }

    // Create a peer connection
    const pc = new RTCPeerConnection();

    // Set up to play remote audio from the model
    audioElement.current = document.createElement("audio");
    audioElement.current.autoplay = true;
    pc.ontrack = (e) => {
      if (audioElement.current) {
        audioElement.current.srcObject = e.streams[0];
      }
    };

    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    pc.addTrack(ms.getTracks()[0]);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    setDataChannel(dc);

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log("Offer SDP:", offer.sdp);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-realtime-preview-2024-12-17";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
    });

    const answer: RTCSessionDescriptionInit = {
      type: "answer" as RTCSdpType,
      sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);
    console.log("Answer SDP:", answer.sdp);

    peerConnection.current = pc;
  };

  // Stop current session, clean up peer connection and data channel
  const stopSession = () => {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
  };

  // Send a message to the model
  const sendClientEvent = (message: { event_id?: string }) => {
    if (dataChannel) {
      message.event_id = message.event_id || crypto.randomUUID();
      dataChannel.send(JSON.stringify(message));
      setEvents((prev) => [message, ...prev]);
    } else {
      console.error(
        "Failed to send message - no data channel available",
        message,
      );
    }
  };

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      // Append new server events to the list
      dataChannel.addEventListener("message", (e) => {
        setEvents((prev) => [JSON.parse(e.data), ...prev]);
      });

      // Set session active when the data channel is opened
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
        setEvents([]);
      });
    }
  }, [dataChannel]);

  // フィルターされた債務者リスト
  const filteredDebtors = debtors.filter(debtor => {
    const matchesFilter = filter === '全て' || debtor.status === filter;
    const matchesSearch = searchTerm === '' || 
      debtor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      debtor.notes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // 督促の優先度に基づいて色を取得
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case '高': return 'text-red-600';
      case '中': return 'text-amber-500';
      case '低': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // 支払い状況に基づいて色とアイコンを取得
  const getStatusInfo = (status: string) => {
    switch(status) {
      case '支払済み': 
        return { color: 'text-green-600 bg-green-100', icon: <Check size={16} /> };
      case '遅延': 
        return { color: 'text-red-600 bg-red-100', icon: <AlertCircle size={16} /> };
      case '未払い': 
        return { color: 'text-amber-500 bg-amber-100', icon: <Clock size={16} /> };
      default: 
        return { color: 'text-gray-600 bg-gray-100', icon: <FileText size={16} /> };
    }
  };

  // 連絡方法に基づいてアイコンを取得
  const getContactMethodIcon = (method: string) => {
    switch(method) {
      case 'メール': return <Mail size={14} />;
      case '電話': return <Phone size={14} />;
      case '訪問': return <User size={14} />;
      default: return <FileText size={14} />;
    }
  };

  // 新規債務者の追加
  const handleAddDebtor = () => {
    if (newDebtor.name && newDebtor.amount && newDebtor.dueDate) {
      const amount = parseFloat(newDebtor.amount);
      if (isNaN(amount)) return;
      const currentDate = new Date().toISOString().split('T')[0];
      setDebtors([
        ...debtors,
        {
          id: debtors.length + 1,
          ...newDebtor, amount,
          lastContact: newDebtor.lastContact || currentDate
        }
      ]);
      setNewDebtor({
        name: '',
        amount: '',
        dueDate: '',
        status: '未払い',
        lastContact: '',
        contactMethod: 'メール',
        notes: '',
        priority: '中'
      });
      setIsAddingNew(false);
    }
  };

  // 債務者の削除
  const handleDeleteDebtor = (id: number) => {
    setDebtors(debtors.filter(debtor => debtor.id !== id));
    if (selectedDebtor && selectedDebtor.id === id) {
      setSelectedDebtor(null);
    }
  };

  // 連絡記録の追加
  const handleAddContactLog = () => {
    if (selectedDebtor && newContactLog) {
      const currentDate = new Date().toISOString().split('T')[0];
      const updatedDebtors = debtors.map(debtor => {
        if (debtor.id === selectedDebtor.id) {
          return {
            ...debtor,
            lastContact: currentDate,
            notes: `${currentDate}: ${newContactLog}\n${debtor.notes}`
          };
        }
        return debtor;
      });
      setDebtors(updatedDebtors);
      setSelectedDebtor({
        ...selectedDebtor,
        lastContact: currentDate,
        notes: `${currentDate}: ${newContactLog}\n${selectedDebtor.notes}`
      });
      setNewContactLog('');
    }
  };

  // 支払い状況の更新
  const handleStatusUpdate = (id: number, newStatus: string) => {
    const updatedDebtors = debtors.map(debtor => {
      if (debtor.id === id) {
        return { ...debtor, status: newStatus };
      }
      return debtor;
    });
    setDebtors(updatedDebtors);
    
    if (selectedDebtor && selectedDebtor.id === id) {
      setSelectedDebtor({ ...selectedDebtor, status: newStatus });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">債権督促管理ツール</h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsAddingNew(true)}
              className="bg-white text-indigo-700 px-3 py-1 rounded flex items-center text-sm"
            >
              <Plus size={16} className="mr-1" /> 新規追加
            </button>
            <button className="bg-indigo-600 px-3 py-1 rounded flex items-center text-sm">
              <RefreshCw size={16} className="mr-1" /> 更新
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* サイドバー: 債務者リスト */}
        <div className="w-1/3 bg-white shadow-md flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center mb-4 space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="検索..."
                  className="w-full pl-8 pr-2 py-2 border rounded text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={16} className="absolute left-2 top-2.5 text-gray-400" />
              </div>
              <div className="relative">
                <select
                  className="appearance-none pl-8 pr-8 py-2 border rounded text-sm bg-white"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="全て">全て</option>
                  <option value="未払い">未払い</option>
                  <option value="遅延">遅延</option>
                  <option value="支払済み">支払済み</option>
                </select>
                <Filter size={16} className="absolute left-2 top-2.5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredDebtors.map(debtor => {
              const statusInfo = getStatusInfo(debtor.status);
              return (
                <div 
                  key={debtor.id}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${selectedDebtor && selectedDebtor.id === debtor.id ? 'bg-indigo-50' : ''}`}
                  onClick={() => setSelectedDebtor(debtor)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{debtor.name}</span>
                      <div className="text-sm text-gray-600">
                        {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(debtor.amount)}
                        <span className="mx-2">•</span>
                        期限: {debtor.dueDate}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs flex items-center ${statusInfo.color}`}>
                      {statusInfo.icon}
                      <span className="ml-1">{debtor.status}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className={`text-xs ${getPriorityColor(debtor.priority)}`}>
                      優先度: {debtor.priority}
                    </span>
                    <span className="mx-2 text-gray-300">|</span>
                    <div className="text-xs text-gray-500 flex items-center">
                      {getContactMethodIcon(debtor.contactMethod)}
                      <span className="ml-1">最終連絡: {debtor.lastContact}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* メインコンテンツ: 債務者詳細 */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedDebtor ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedDebtor.name}</h2>
                  <p className="text-gray-600">
                    請求額: {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(selectedDebtor.amount)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedDebtor.status}
                    onChange={(e) => handleStatusUpdate(selectedDebtor.id, e.target.value)}
                    className="border rounded py-1 px-2 text-sm"
                  >
                    <option value="未払い">未払い</option>
                    <option value="遅延">遅延</option>
                    <option value="支払済み">支払済み</option>
                  </select>
                  <button 
                    onClick={() => handleDeleteDebtor(selectedDebtor.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">期限日</h3>
                  <p className="text-lg">{selectedDebtor.dueDate}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">最終連絡日</h3>
                  <p className="text-lg">{selectedDebtor.lastContact}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-md font-semibold mb-2">連絡履歴・メモ</h3>
                <div className="border rounded-lg p-4 bg-gray-50 h-32 overflow-y-auto whitespace-pre-line">
                  {selectedDebtor.notes || '履歴はありません'}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-md font-semibold mb-2">取引先への連絡</h3>
                <div className="flex space-x-2">
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded flex items-center text-sm"
                    onClick={() => {
                      alert(`${selectedDebtor.name}に電話をかけています...\n（実際の電話機能は実装されていません）`);
                      startSession();
                    }}
                  >
                    <Phone size={16} className="mr-2" />
                    電話をする
                  </button>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center text-sm"
                    onClick={() => {
                      alert(`${selectedDebtor.name}宛にメールを準備しています...\n（実際のメール機能は実装されていません）`);
                      setNewContactLog(`${selectedDebtor.name}にメール連絡を行いました。`);
                    }}
                  >
                    <Mail size={16} className="mr-2" />
                    メールを送る
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold mb-2">新規連絡記録</h3>
                <div className="flex space-x-2">
                  <select
                    className="border rounded py-2 px-3 text-sm w-32"
                    value={selectedDebtor.contactMethod}
                    onChange={(e) => {
                      const updatedDebtor = { ...selectedDebtor, contactMethod: e.target.value };
                      setSelectedDebtor(updatedDebtor);
                      setDebtors(debtors.map(d => d.id === selectedDebtor.id ? updatedDebtor : d));
                    }}
                  >
                    <option value="メール">メール</option>
                    <option value="電話">電話</option>
                    <option value="訪問">訪問</option>
                  </select>
                  <input
                    type="text"
                    className="flex-1 border rounded py-2 px-3 text-sm"
                    placeholder="連絡内容を入力..."
                    value={newContactLog}
                    onChange={(e) => setNewContactLog(e.target.value)}
                  />
                  <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded text-sm"
                    onClick={handleAddContactLog}
                  >
                    記録
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              取引先を選択するか、新規追加してください
            </div>
          )}
        </div>
      </div>

      {/* 新規債務者追加モーダル */}
      {isAddingNew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">新規取引先追加</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  取引先名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded py-2 px-3"
                  value={newDebtor.name}
                  onChange={(e) => setNewDebtor({...newDebtor, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  請求額 (円) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full border rounded py-2 px-3"
                  value={newDebtor.amount}
                  onChange={(e) => setNewDebtor({...newDebtor, amount: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  支払期限 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full border rounded py-2 px-3"
                  value={newDebtor.dueDate}
                  onChange={(e) => setNewDebtor({...newDebtor, dueDate: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  優先度
                </label>
                <select
                  className="w-full border rounded py-2 px-3"
                  value={newDebtor.priority}
                  onChange={(e) => setNewDebtor({...newDebtor, priority: e.target.value})}
                >
                  <option value="高">高</option>
                  <option value="中">中</option>
                  <option value="低">低</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メモ
                </label>
                <textarea
                  className="w-full border rounded py-2 px-3 h-20"
                  value={newDebtor.notes}
                  onChange={(e) => setNewDebtor({...newDebtor, notes: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-2">
              <button
                className="px-4 py-2 border rounded text-sm"
                onClick={() => setIsAddingNew(false)}
              >
                キャンセル
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm"
                onClick={handleAddDebtor}
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtCollectionApp;
