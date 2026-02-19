'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL, getToken, clearToken } from '../lib/api';
import { formatDate, toDateInput } from '../lib/date';

type Task = {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  dueDate?: string;
  createdAt: string;
};

function toIsoDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dueFilter, setDueFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const token = getToken();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [tasks]);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchTasks();
  }, [token, statusFilter, dueFilter]);

  async function fetchTasks() {
    setError('');
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (dueFilter) params.set('dueDate', dueFilter);

    const res = await fetch(`${API_URL}/api/tasks?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 401) {
      clearToken();
      router.push('/login');
      return;
    }

    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    } else {
      setError('Failed to load tasks.');
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setError('');
    setCreating(true);

    const tempId = `temp-${Date.now()}`;
    const optimistic: Task = {
      _id: tempId,
      title: title.trim(),
      description: description.trim() || undefined,
      status: 'pending',
      dueDate: toIsoDate(dueDate),
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [optimistic, ...prev]);

    const res = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: optimistic.title,
        description: optimistic.description,
        dueDate: optimistic.dueDate
      })
    });

    if (!res.ok) {
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      setError('Failed to create task.');
      setCreating(false);
      return;
    }

    const saved = await res.json();
    setTasks((prev) => prev.map((t) => (t._id === tempId ? saved : t)));

    setTitle('');
    setDescription('');
    setDueDate('');
    setCreating(false);
  }

  async function handleUpdate(taskId: string) {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    const prev = [...tasks];
    setSavingId(taskId);

    const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null
      })
    });

    if (!res.ok) {
      setTasks(prev);
      setError('Failed to update task.');
      setSavingId(null);
      return;
    }

    const updated = await res.json();
    setTasks((prevState) => prevState.map((t) => (t._id === taskId ? updated : t)));
    setSavingId(null);
    setEditingId(null);
  }

  async function toggleStatus(taskId: string) {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    const nextStatus = task.status === 'pending' ? 'completed' : 'pending';
    const prev = [...tasks];
    setTasks((prevState) =>
      prevState.map((t) => (t._id === taskId ? { ...t, status: nextStatus } : t))
    );

    const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: nextStatus })
    });

    if (!res.ok) {
      setTasks(prev);
      setError('Failed to update status.');
    }
  }

  async function handleDelete(taskId: string) {
    const prev = [...tasks];
    setTasks((prevState) => prevState.filter((t) => t._id !== taskId));

    const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      setTasks(prev);
      setError('Failed to delete task.');
    }
  }

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  return (
    <div className="grid fade-in">
      <div className="card">
        <h2>Quick Snapshot</h2>
        <p className="muted">A quick view of your workload today.</p>
        <div className="kpi">
          <span>Total: {stats.total}</span>
          <span>Pending: {stats.pending}</span>
          <span>Completed: {stats.completed}</span>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Create Task</h2>
          <form onSubmit={handleCreate}>
            <div>
              <label>Title</label>
              <input
                type="text"
                placeholder="Design homepage"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Description</label>
              <textarea
                placeholder="Add key context"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label>Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <button type="submit" disabled={creating}>{creating ? 'Adding...' : 'Add Task'}</button>
          </form>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Task Board</h2>
            <button className="secondary" onClick={handleLogout}>Logout</button>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div>
              <label>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label>Due before</label>
              <input type="date" value={dueFilter} onChange={(e) => setDueFilter(e.target.value)} />
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button className="ghost" onClick={fetchTasks}>Refresh</button>
            </div>
          </div>

          {loading ? <p className="muted">Loading tasks...</p> : null}
          {!loading && tasks.length === 0 ? (
            <div className="empty">No tasks yet. Add one to get started.</div>
          ) : null}

          {tasks.map((task) => (
            <div key={task._id} className="task-row">
              <div>
                {editingId === task._id ? (
                  <div className="grid">
                    <input
                      value={task.title}
                      onChange={(e) => {
                        setTasks((prev) =>
                          prev.map((t) => (t._id === task._id ? { ...t, title: e.target.value } : t))
                        );
                      }}
                    />
                    <textarea
                      value={task.description || ''}
                      onChange={(e) => {
                        setTasks((prev) =>
                          prev.map((t) =>
                            t._id === task._id ? { ...t, description: e.target.value } : t
                          )
                        );
                      }}
                    />
                    <div className="grid">
                      <select
                        value={task.status}
                        onChange={(e) => {
                          setTasks((prev) =>
                            prev.map((t) =>
                              t._id === task._id
                                ? { ...t, status: e.target.value as 'pending' | 'completed' }
                                : t
                            )
                          );
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                      <input
                        type="date"
                        value={toDateInput(task.dueDate)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setTasks((prev) =>
                            prev.map((t) =>
                              t._id === task._id
                                ? { ...t, dueDate: value ? new Date(value).toISOString() : undefined }
                                : t
                            )
                          );
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="task-title">
                      {task.title}
                      <span className={`badge ${task.status}`}>{task.status}</span>
                    </div>
                    {task.description ? <p className="muted">{task.description}</p> : null}
                    <p className="muted">Due: {formatDate(task.dueDate)}</p>
                  </div>
                )}
              </div>
              <div className="task-actions">
                <button className="ghost" onClick={() => toggleStatus(task._id)}>
                  {task.status === 'pending' ? 'Mark done' : 'Reopen'}
                </button>
                {editingId === task._id ? (
                  <button onClick={() => handleUpdate(task._id)} disabled={savingId === task._id}>
                    {savingId === task._id ? 'Saving...' : 'Save'}
                  </button>
                ) : (
                  <button onClick={() => setEditingId(task._id)}>Edit</button>
                )}
                <button className="secondary" onClick={() => handleDelete(task._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
