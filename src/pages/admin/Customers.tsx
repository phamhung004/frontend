import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import userService from '../../services/userService';
import { USER_ROLES, USER_STATUSES } from '../../constants/user';
import type { AdminUser, UserRole, UserStatus } from '../../types/user';
import { useToast } from '../../components/ui/ToastContainer';

const PAGE_SIZE = 10;

const Customers = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      const sorted = [...data].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
      setUsers(sorted);
    } catch (error) {
      console.error('Failed to load users', error);
      toast.error(t('admin.usersPage.fetchFailure'));
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(0);
  };

  const handleRoleChange = async (user: AdminUser, role: UserRole) => {
    if (role === user.role) {
      return;
    }

    setUpdatingUserId(user.id);
    try {
      const updated = await userService.updateUser(user.id, { role });
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)));
      toast.success(t('admin.usersPage.updateSuccess'));
    } catch (error) {
      console.error('Failed to update user role', error);
      toast.error(t('admin.usersPage.updateFailure'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleStatusChange = async (user: AdminUser, status: UserStatus) => {
    if (status === user.status) {
      return;
    }

    setUpdatingUserId(user.id);
    try {
      const updated = await userService.updateUser(user.id, { status });
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)));
      toast.success(t('admin.usersPage.updateSuccess'));
    } catch (error) {
      console.error('Failed to update user status', error);
      toast.error(t('admin.usersPage.updateFailure'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      if (roleFilter && user.role !== roleFilter) {
        return false;
      }

      if (statusFilter && user.status !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const candidates = [user.fullName, user.email, user.phone].filter(Boolean) as string[];
      return candidates.some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [roleFilter, search, statusFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const canGoPrev = page > 0;
  const canGoNext = page + 1 < totalPages;
  const paginatedUsers = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  useEffect(() => {
    setPage(0);
  }, [search, roleFilter, statusFilter]);

  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => user.status === 'ACTIVE').length;
    const admins = users.filter((user) => user.role === 'ADMIN').length;
    const suspended = users.filter((user) => user.status === 'SUSPENDED').length;
    return {
      total,
      active,
      admins,
      suspended,
    };
  }, [users]);

  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return t('admin.usersPage.notAvailable');
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return t('admin.usersPage.notAvailable');
    }
    return date.toLocaleString();
  };

  const statusBadgeClasses: Record<UserStatus, string> = {
    ACTIVE: 'bg-green-50 text-green-700 ring-green-100',
    INACTIVE: 'bg-gray-100 text-gray-600 ring-gray-200',
    SUSPENDED: 'bg-red-50 text-red-700 ring-red-100',
  };

  const renderAvatar = (user: AdminUser) => {
    const displayName = user.fullName || user.email;
    if (user.avatarUrl) {
      return (
        <img
          src={user.avatarUrl}
          alt={displayName ?? 'User avatar'}
          className="h-9 w-9 rounded-full object-cover"
        />
      );
    }

    const fallback = (displayName || '?').charAt(0).toUpperCase();
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-brand-purple">
        {fallback}
      </div>
    );
  };

  return (
    <div className="p-7 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-brand-purple">{t('admin.usersPage.title')}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setPage(0);
              void fetchUsers();
            }}
            className="px-4 py-2 text-sm font-medium text-brand-purple border border-brand-purple rounded-lg hover:bg-purple-50"
          >
            {t('admin.usersPage.refresh')}
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            {t('admin.usersPage.clearFilters')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-2 text-brand-purple">
              <UserGroupIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">{t('admin.usersPage.totalUsers')}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{metrics.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-2 text-green-600">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">{t('admin.usersPage.activeUsers')}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{metrics.active}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">{t('admin.usersPage.adminUsers')}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{metrics.admins}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-2 text-red-600">
              <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">{t('admin.usersPage.suspendedUsers')}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{metrics.suspended}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder={t('admin.usersPage.searchPlaceholder')}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-brand-purple focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value as UserRole | '');
              setPage(0);
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-purple focus:outline-none"
          >
            <option value="">{t('admin.usersPage.allRoles')}</option>
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {t(`admin.usersPage.roleLabels.${role}`, role)}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as UserStatus | '');
              setPage(0);
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-purple focus:outline-none"
          >
            <option value="">{t('admin.usersPage.allStatuses')}</option>
            {USER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`admin.usersPage.statusLabels.${status}`, status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('admin.usersPage.table.name')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('admin.usersPage.table.email')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('admin.usersPage.table.phone')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('admin.usersPage.table.role')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('admin.usersPage.table.status')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('admin.usersPage.table.lastLogin')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('admin.usersPage.table.createdAt')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    {t('admin.usersPage.loading')}
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    {t('admin.usersPage.empty')}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isUpdating = updatingUserId === user.id;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {renderAvatar(user)}
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {user.fullName || user.email}
                            </div>
                            {user.authUserId && (
                              <div className="text-[11px] uppercase tracking-wide text-gray-400">{user.authUserId}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{user.phone || t('admin.usersPage.notAvailable')}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          disabled={isUpdating}
                          onChange={(event) => {
                            const value = event.target.value as UserRole;
                            void handleRoleChange(user, value);
                          }}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs uppercase tracking-wide text-gray-700 focus:border-brand-purple focus:outline-none"
                        >
                          {USER_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {t(`admin.usersPage.roleLabels.${role}`, role)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusBadgeClasses[user.status]}`}
                          >
                            {t(`admin.usersPage.statusLabels.${user.status}`, user.status)}
                          </span>
                          <select
                            value={user.status}
                            disabled={isUpdating}
                            onChange={(event) => {
                              const value = event.target.value as UserStatus;
                              void handleStatusChange(user, value);
                            }}
                            className="rounded-lg border border-gray-200 px-2 py-1 text-xs uppercase tracking-wide text-gray-700 focus:border-brand-purple focus:outline-none"
                          >
                            {USER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {t(`admin.usersPage.statusLabels.${status}`, status)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(user.lastLoginAt)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(user.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 text-xs text-gray-500">
          <span>
            {t('admin.usersPage.paginationSummary', {
              from: paginatedUsers.length === 0 ? 0 : page * PAGE_SIZE + 1,
              to: page * PAGE_SIZE + paginatedUsers.length,
              total: filteredUsers.length,
            })}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => canGoPrev && setPage((prev) => Math.max(prev - 1, 0))}
              className={`rounded-lg border border-gray-200 px-3 py-1 font-medium ${
                canGoPrev ? 'text-gray-700 hover:bg-gray-100' : 'cursor-not-allowed text-gray-400'
              }`}
            >
              {t('admin.usersPage.prev')}
            </button>
            <span className="font-semibold text-gray-700">
              {Math.min(page + 1, totalPages)} / {totalPages}
            </span>
            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => canGoNext && setPage((prev) => prev + 1)}
              className={`rounded-lg border border-gray-200 px-3 py-1 font-medium ${
                canGoNext ? 'text-gray-700 hover:bg-gray-100' : 'cursor-not-allowed text-gray-400'
              }`}
            >
              {t('admin.usersPage.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
