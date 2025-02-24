import { useState, useEffect} from 'react';
import { fetchUserAccounts, UserAccount } from '../Api';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from './ui/table';
import {Card } from './ui/card';

export function UserAccountList() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  useEffect(() => {
    fetchUserAccounts()
      .then((res) => res.json())
      .then(setAccounts)
      .catch((err) => console.error(err));
  }, []);
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>名前</TableHead>
            <TableHead>email</TableHead>
            <TableHead>電話番号</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((ac) => (
            <TableRow key={ac.id}>
              <TableCell>{ac.id}</TableCell>
              <TableCell>{ac.lastName} {ac.firstName}</TableCell>
              <TableCell>{ac.email}</TableCell>
              <TableCell>{ac.phoneNumber}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}