import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Pencil,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Filter,
  Download,
  MoreVertical,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  RefreshCw,
  ChevronDown as ExpandIcon,
  ChevronRight as CollapseIcon,
} from 'lucide-react';
import { Button } from './Button';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: string | number;
  minWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  hidden?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  renderFilter?: () => React.ReactNode;
  sticky?: boolean;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowKey: (row: T) => string | number;

  // Actions
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  rowActions?: (row: T) => Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: 'default' | 'danger';
  }>;

  // Selection
  selectable?: boolean;
  selectedRows?: Set<string | number>;
  onSelectionChange?: (selectedRows: Set<string | number>) => void;

  // Bulk Actions
  bulkActions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (selectedRows: Set<string | number>) => void;
    variant?: 'default' | 'danger';
  }>;

  // Expandable Rows
  expandable?: boolean;
  renderExpandedRow?: (row: T) => React.ReactNode;

  // Sorting
  sortable?: boolean;
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
  onSort?: (key: string, direction: 'asc' | 'desc') => void;

  // Filtering
  filterable?: boolean;
  onFilter?: (filters: Record<string, any>) => void;

  // Pagination
  pagination?: boolean;
  pageSize?: number;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  pageSizeOptions?: number[];

  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;

  // Appearance
  size?: 'sm' | 'md' | 'lg';
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string | number;

  // Responsive
  responsive?: 'scroll' | 'stack' | 'collapse';
  mobileBreakpoint?: number;

  // Features
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  showColumnToggle?: boolean;
  exportable?: boolean;
  onExport?: (format: 'csv' | 'json') => void;
  refreshable?: boolean;
  onRefresh?: () => void;

  // Styling
  className?: string;
  rowClassName?: (row: T, index: number) => string;
  cellClassName?: (row: T, column: Column<T>) => string;
}

export const Table = <T extends object>({
  columns: initialColumns,
  data,
  getRowKey,
  onEdit,
  onDelete,
  onView,
  rowActions,
  selectable = false,
  selectedRows: controlledSelectedRows,
  onSelectionChange,
  bulkActions,
  expandable = false,
  renderExpandedRow,
  sortable: globalSortable = false,
  defaultSort,
  onSort: externalOnSort,
  filterable = false,
  onFilter,
  pagination = false,
  pageSize: initialPageSize = 10,
  totalItems,
  currentPage: controlledCurrentPage,
  onPageChange: externalOnPageChange,
  pageSizeOptions = [10, 25, 50, 100],
  searchable = false,
  searchPlaceholder = 'Buscar...',
  onSearch,
  size = 'md',
  striped = false,
  bordered = false,
  hoverable = true,
  stickyHeader = false,
  maxHeight,
  responsive = 'scroll',
  mobileBreakpoint = 768,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  emptyIcon,
  showColumnToggle = false,
  exportable = false,
  onExport,
  refreshable = false,
  onRefresh,
  className = '',
  rowClassName,
  cellClassName,
}: TableProps<T>) => {
  // Internal state
  const [internalSelectedRows, setInternalSelectedRows] = useState<Set<string | number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    defaultSort || null
  );
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(initialColumns.filter((col) => !col.hidden).map((col) => String(col.key)))
  );
  const [isMobile, setIsMobile] = useState(false);

  const selectedRows = controlledSelectedRows ?? internalSelectedRows;
  const currentPage = controlledCurrentPage ?? internalCurrentPage;

  // Columns filtering by visibility
  const columns = useMemo(
    () => initialColumns.filter((col) => visibleColumns.has(String(col.key))),
    [initialColumns, visibleColumns]
  );

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  // Sorting
  const handleSort = useCallback(
    (key: string) => {
      const direction =
        sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';

      setSortConfig({ key, direction });
      externalOnSort?.(key, direction);
    },
    [sortConfig, externalOnSort]
  );

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  // Paginated data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination, currentPage, pageSize]);

  const totalPages = Math.ceil((totalItems || data.length) / pageSize);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      const newSelection = new Set(selectedRows);
      paginatedData.forEach((row) => newSelection.delete(getRowKey(row)));
      setInternalSelectedRows(newSelection);
      onSelectionChange?.(newSelection);
    } else {
      const newSelection = new Set(selectedRows);
      paginatedData.forEach((row) => newSelection.add(getRowKey(row)));
      setInternalSelectedRows(newSelection);
      onSelectionChange?.(newSelection);
    }
  };

  const handleSelectRow = (rowKey: string | number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowKey)) {
      newSelection.delete(rowKey);
    } else {
      newSelection.add(rowKey);
    }
    setInternalSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const isAllSelected = paginatedData.length > 0 && selectedRows.size === paginatedData.length;
  const isSomeSelected = selectedRows.size > 0 && selectedRows.size < paginatedData.length;

  // Expand handlers
  const handleToggleExpand = (rowKey: string | number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowKey)) {
      newExpanded.delete(rowKey);
    } else {
      newExpanded.add(rowKey);
    }
    setExpandedRows(newExpanded);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setInternalCurrentPage(page);
    externalOnPageChange?.(page);
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const cellPaddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-6',
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {selectable && <th className={cellPaddingClasses[size]}></th>}
                {expandable && <th className={cellPaddingClasses[size]}></th>}
                {columns.map((column, index) => (
                  <th key={index} className={`${cellPaddingClasses[size]} text-left`}>
                    <Skeleton variant="text" width="80%" height={16} />
                  </th>
                ))}
                {(onEdit || onDelete || onView || rowActions) && (
                  <th className={cellPaddingClasses[size]}></th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(pageSize)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {selectable && (
                    <td className={cellPaddingClasses[size]}>
                      <Skeleton variant="rectangular" width={16} height={16} />
                    </td>
                  )}
                  {expandable && (
                    <td className={cellPaddingClasses[size]}>
                      <Skeleton variant="rectangular" width={16} height={16} />
                    </td>
                  )}
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className={cellPaddingClasses[size]}>
                      <Skeleton variant="text" width="100%" />
                    </td>
                  ))}
                  {(onEdit || onDelete || onView || rowActions) && (
                    <td className={cellPaddingClasses[size]}>
                      <Skeleton variant="rectangular" width={80} height={32} className="ml-auto" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          {emptyIcon || (
            <svg
              className="w-16 h-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          )}
          <p className="text-gray-900 text-lg font-medium mb-1">{emptyMessage}</p>
          <p className="text-gray-500 text-sm">Intenta ajustar los filtros o crear un nuevo registro.</p>
        </div>
      </div>
    );
  }

  const hasActions = !!(onEdit || onDelete || onView || rowActions);

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Toolbar */}
      {(searchable || bulkActions || showColumnToggle || exportable || refreshable) && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Search & Bulk Actions */}
            <div className="flex items-center gap-3 flex-1">
              {searchable && (
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      onSearch?.(e.target.value);
                    }}
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              )}

              {selectedRows.size > 0 && bulkActions && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-lg">
                  <span className="text-sm font-medium text-primary-900">
                    {selectedRows.size} seleccionado{selectedRows.size > 1 ? 's' : ''}
                  </span>
                  <div className="flex gap-1">
                    {bulkActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => action.onClick(selectedRows)}
                          className={`px-3 py-1 text-sm font-medium rounded transition-colors ${action.variant === 'danger'
                              ? 'text-red-700 hover:bg-red-100'
                              : 'text-primary-700 hover:bg-primary-100'
                            }`}
                        >
                          {Icon && <Icon className="w-4 h-4 inline mr-1" />}
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {refreshable && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RefreshCw}
                  onClick={onRefresh}
                  aria-label="Actualizar"
                />
              )}

              {exportable && (
                <div className="relative group">
                  <Button variant="ghost" size="sm" icon={Download}>
                    Exportar
                  </Button>
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => onExport?.('csv')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg"
                    >
                      Exportar CSV
                    </button>
                    <button
                      onClick={() => onExport?.('json')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg"
                    >
                      Exportar JSON
                    </button>
                  </div>
                </div>
              )}

              {showColumnToggle && (
                <div className="relative group">
                  <Button variant="ghost" size="sm" icon={Settings}>
                    Columnas
                  </Button>
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 p-2">
                    {initialColumns.map((column) => (
                      <label
                        key={String(column.key)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns.has(String(column.key))}
                          onChange={(e) => {
                            const newVisible = new Set(visibleColumns);
                            if (e.target.checked) {
                              newVisible.add(String(column.key));
                            } else {
                              newVisible.delete(String(column.key));
                            }
                            setVisibleColumns(newVisible);
                          }}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm">{column.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className="overflow-x-auto"
        style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
      >
        <table className={`min-w-full divide-y divide-gray-200 ${sizeClasses[size]}`}>
          {/* Header */}
          <thead className={`bg-gray-50 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {selectable && (
                <th className={`${cellPaddingClasses[size]} w-12`}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    aria-label="Seleccionar todo"
                  />
                </th>
              )}

              {expandable && <th className={`${cellPaddingClasses[size]} w-12`}></th>}

              {columns.map((column) => {
                const isSortable = column.sortable ?? globalSortable;
                const isSorted = sortConfig?.key === column.key;
                const align = column.align || 'left';

                return (
                  <th
                    key={String(column.key)}
                    className={`
                      ${cellPaddingClasses[size]}
                      text-${align}
                      text-xs font-medium text-gray-500 uppercase tracking-wider
                      ${isSortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''}
                      ${column.sticky ? 'sticky left-0 bg-gray-50 z-10' : ''}
                    `}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth,
                    }}
                    onClick={() => isSortable && handleSort(String(column.key))}
                  >
                    <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''}`}>
                      {column.renderHeader ? column.renderHeader() : column.label}
                      {isSortable && (
                        <span className="inline-flex">
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}

              {hasActions && (
                <th className={`${cellPaddingClasses[size]} text-right text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className={`bg-white divide-y divide-gray-200 ${bordered ? 'border' : ''}`}>
            {paginatedData.map((row, rowIndex) => {
              const rowKey = getRowKey(row);
              const isSelected = selectedRows.has(rowKey);
              const isExpanded = expandedRows.has(rowKey);
              const customRowClass = rowClassName?.(row, rowIndex) || '';

              return (
                <React.Fragment key={rowKey}>
                  <tr
                    className={`
                      ${hoverable ? 'hover:bg-gray-50' : ''}
                      ${striped && rowIndex % 2 === 1 ? 'bg-gray-25' : ''}
                      ${isSelected ? 'bg-primary-50' : ''}
                      ${customRowClass}
                      transition-colors
                    `}
                  >
                    {selectable && (
                      <td className={cellPaddingClasses[size]}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowKey)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                          aria-label={`Seleccionar fila ${rowIndex + 1}`}
                        />
                      </td>
                    )}

                    {expandable && (
                      <td className={cellPaddingClasses[size]}>
                        <button
                          onClick={() => handleToggleExpand(rowKey)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          aria-label={isExpanded ? 'Contraer' : 'Expandir'}
                        >
                          {isExpanded ? (
                            <ExpandIcon className="w-4 h-4" />
                          ) : (
                            <CollapseIcon className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}

                    {columns.map((column) => {
                      const align = column.align || 'left';
                      const cellClass = cellClassName?.(row, column) || '';

                      return (
                        <td
                          key={String(column.key)}
                          className={`
                            ${cellPaddingClasses[size]}
                            text-${align}
                            text-gray-900
                            ${column.sticky ? 'sticky left-0 bg-white z-5' : ''}
                            ${cellClass}
                          `}
                          style={{
                            width: column.width,
                            minWidth: column.minWidth,
                          }}
                        >
                          {column.render ? column.render(row, rowIndex) : (row as any)[column.key]}
                        </td>
                      );
                    })}

                    {hasActions && (
                      <td className={`${cellPaddingClasses[size]} text-right`}>
                        <div className="flex items-center justify-end gap-1">
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              aria-label="Eliminar"
                            />
                          )}
                          {rowActions && (
                            <div className="relative group">
                              <Button variant="ghost" size="sm" icon={MoreVertical} />
                              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                {rowActions(row).map((action, index) => {
                                  const Icon = action.icon;
                                  return (
                                    <button
                                      key={index}
                                      onClick={action.onClick}
                                      className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${action.variant === 'danger'
                                          ? 'text-red-600 hover:bg-red-50'
                                          : 'hover:bg-gray-50'
                                        } ${index === 0 ? 'rounded-t-lg' : ''} ${index === rowActions(row).length - 1 ? 'rounded-b-lg' : ''
                                        }`}
                                    >
                                      {Icon && <Icon className="w-4 h-4" />}
                                      {action.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>

                  {/* Expanded Row */}
                  {expandable && isExpanded && renderExpandedRow && (
                    <tr>
                      <td
                        colSpan={
                          columns.length +
                          (selectable ? 1 : 0) +
                          (expandable ? 1 : 0) +
                          (hasActions ? 1 : 0)
                        }
                        className="px-6 py-4 bg-gray-50"
                      >
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Page size selector */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>Mostrar</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setInternalCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span>
                de {totalItems || data.length} registro{(totalItems || data.length) !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={ChevronLeft}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior"
              />

              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-1 text-sm font-medium rounded transition-colors ${currentPage === pageNumber
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="sm"
                icon={ChevronRight}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Página siguiente"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Example Usage
export const TableShowcase = () => {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    joinDate: string;
  }

  const users: User[] = [
    { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Admin', status: 'active', joinDate: '2024-01-15' },
    { id: 2, name: 'María García', email: 'maria@example.com', role: 'User', status: 'active', joinDate: '2024-02-20' },
    { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'Editor', status: 'inactive', joinDate: '2024-03-10' },
    // Add more...
  ];

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      sticky: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      render: (user) => (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {user.role}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      align: 'center',
      render: (user) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
            }`}
        >
          {user.status === 'active' ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'joinDate',
      label: 'Fecha de Registro',
      sortable: true,
      align: 'right',
    },
  ];

  return (
    <div className="p-8 space-y-8 bg-gray-50">
      <h2 className="text-2xl font-bold">Advanced Table Component</h2>

      <Table
        columns={columns}
        data={users}
        getRowKey={(user) => user.id}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        sortable
        searchable
        pagination
        pageSize={5}
        hoverable
        stickyHeader
        showColumnToggle
        exportable
        refreshable
        bulkActions={[
          {
            label: 'Activar',
            onClick: (rows) => console.log('Activate', rows),
          },
          {
            label: 'Eliminar',
            variant: 'danger',
            onClick: (rows) => console.log('Delete', rows),
          },
        ]}
        onEdit={(user) => console.log('Edit', user)}
        onDelete={(user) => console.log('Delete', user)}
        onView={(user) => console.log('View', user)}
        onExport={(format) => console.log('Export', format)}
        onRefresh={() => console.log('Refresh')}
      />
    </div>
  );
};
