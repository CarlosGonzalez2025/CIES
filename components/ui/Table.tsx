
import React from 'react';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from './Button';
import { Skeleton } from './Skeleton';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  isLoading?: boolean;
  className?: string;
  getRowKey: (row: T) => string | number;
}

export const Table = <T extends object,>({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
  className,
  getRowKey,
}: TableProps<T>) => {

  if (isLoading) {
    return (
      <div className={`overflow-x-auto shadow-md rounded-lg bg-white ${className}`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.label}
                </th>
              ))}
               {(onEdit || onDelete || onView) && <th className="px-6 py-3"></th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
                {(onEdit || onDelete || onView) && (
                   <td className="px-6 py-4">
                      <Skeleton className="h-8 w-16 ml-auto" />
                   </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center text-gray-400">
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-gray-500 text-lg font-medium">No hay datos disponibles</p>
            <p className="text-gray-400 text-sm">Intenta crear un nuevo registro.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto shadow-md rounded-lg ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            {(onEdit || onDelete || onView) && (
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={getRowKey(row)} className="hover:bg-gray-50 transition-colors">
              {columns.map((column) => (
                <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(row) : (row as any)[column.key]}
                </td>
              ))}
              {(onEdit || onDelete || onView) && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => onView(row)}
                      aria-label="Ver"
                    />
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Pencil}
                      onClick={() => onEdit(row)}
                      aria-label="Editar"
                    />
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => onDelete(row)}
                      className="text-red-600 hover:text-red-700"
                      aria-label="Eliminar"
                    />
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
