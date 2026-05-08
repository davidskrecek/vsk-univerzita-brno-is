'use client';

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';

import { useMemo, useState } from 'react';
import { User } from '@/lib/queries/users';
import LabeledInput from "@/components/Common/LabeledInput";
import LabeledSelect from "@/components/Common/LabeledSelect";

type UserTableProps = {
    users: User[];
    onEdit: (user: User) => void;
    onPasswordRestart: (user: User) => void;
};

export default function UsersTable({users, onEdit, onPasswordRestart}: UserTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const text = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase();

            const matchesSearch = text.includes(search.toLowerCase());
            const matchesActive = activeFilter === 'all' ? true : activeFilter === 'active' ? user.isActive : !user.isActive;

            return matchesSearch && matchesActive;
        });
    }, [users, search, activeFilter]);

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'firstName',
            header: 'Jméno',
        },
        {
            accessorKey: 'lastName',
            header: 'Příjmení',
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'editor.editorRole.name',
            header: 'Role',
        },
        {
            accessorKey: 'isActive',
            header: 'Aktivní',
            cell: ({ row }) => row.original.isActive ? 'Ano' : 'Ne',
        },
        {
            header: 'Akce',
            cell: ({ row }) => (
                <button className="text-sm text-primary hover:underline" onClick={() => onEdit(row.original)}>
                    Správa
                </button>
            ),
        },
        {
            header: 'Heslo',
            cell: ({ row }) => (
                <button className="text-sm text-primary hover:underline" onClick={() => onPasswordRestart(row.original)}>
                    Restartovat
                </button>
            ),
        },
    ];

    const table = useReactTable({
        data: filteredUsers,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <LabeledInput label="Vyhledávání" value={search} onChange={setSearch} placeholder="Hledat jméno, příjmení nebo email." className="w-full"/>
                <LabeledSelect label="Stav" value={activeFilter}
                               onChange={(active) => setActiveFilter(active as | 'all' | 'active' | 'inactive')}
                               options={[
                                      { label: 'Všichni', value: 'all' },
                                      { label: 'Aktivní', value: 'active' },
                                      { label: 'Neaktivní', value: 'inactive' },
                               ]}/>
            </div>

            <table className="w-full border-collapse">
                <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th key={header.id} onClick={header.column.getToggleSortingHandler()} className="cursor-pointer border-b p-3 text-left">
                                <div className="flex items-center gap-2">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {{
                                        asc: '↑',
                                        desc: '↓',
                                    }[header.column.getIsSorted() as string] ?? null}
                                </div>
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>

                <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-surface-container-low">
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="p-3">
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
