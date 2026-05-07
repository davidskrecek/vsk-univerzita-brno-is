'use client';

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';

import { useState } from 'react';
import { User } from '@/lib/queries/users';

type Props = {
    users: User[];
};

export default function UsersTable({ users }: Props) {
    console.log(users);

    const [sorting, setSorting] = useState<SortingState>([]);

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
            cell: ({ row }) =>
                row.original.isActive ? 'Ano' : 'Ne',
        },
    ];

    const table = useReactTable({
        data: users,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <table className="w-full border-collapse">
            <thead>
            {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                        <th
                            key={header.id}
                            onClick={header.column.getToggleSortingHandler()}
                            className="cursor-pointer border-b p-3 text-left"
                        >
                            <div className="flex items-center gap-2">
                                {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}

                                {{
                                    asc: '↑',
                                    desc: '↓',
                                }[
                                    header.column.getIsSorted() as string
                                    ] ?? null}
                            </div>
                        </th>
                    ))}
                </tr>
            ))}
            </thead>

            <tbody>
            {table.getRowModel().rows.map((row) => (
                <tr
                    key={row.id}
                    className="border-b hover:bg-surface-container-low"
                >
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
    );
}
