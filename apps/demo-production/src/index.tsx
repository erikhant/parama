import './index.css';
import '@parama-ui/react/dist/parama-ui.min.css';
import '@parama-dev/form-builder-editor/dist/editor.css';

import { createRoot } from 'react-dom/client';
import type { FormSchema } from '@parama-dev/form-builder-types';
import { FormEditor } from '@parama-dev/form-builder-editor';
import { FormRenderer } from '@parama-dev/form-builder-renderer';
import { nextThemeMode, ThemeProvider, useTheme } from '@parama-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

// User information schema for JSON Server `users` resource
const initialUserSchema: FormSchema = {
  id: 'user-form',
  version: '1.0.0',
  title: 'User Information',
  description: 'Capture employee details',
  layout: {
    colSize: 12,
    gap: 5
  },
  fields: [
    {
      id: 'name',
      name: 'name',
      type: 'text',
      label: 'Full Name',
      helpText: 'Enter full name',
      disabled: false,
      defaultValue: '',
      value: '',
      readOnly: false,
      width: 6,
      validations: [
        {
          trigger: 'change',
          type: 'required',
          message: 'Name is required'
        }
      ],
      appearance: {}
    },
    {
      id: 'email',
      name: 'email',
      type: 'email',
      label: 'Email',
      helpText: 'Enter email address',
      disabled: false,
      defaultValue: '',
      value: '',
      readOnly: false,
      width: 6,
      validations: [
        {
          trigger: 'change',
          type: 'required',
          message: 'Email is required'
        },
        {
          type: 'pattern',
          name: 'email',
          message: 'Invalid email format',
          trigger: 'change',
          value: ''
        }
      ],
      appearance: {}
    },
    {
      id: 'phone',
      name: 'phone',
      type: 'text',
      label: 'Phone',
      helpText: 'Enter phone number',
      disabled: false,
      defaultValue: '',
      value: '',
      readOnly: false,
      width: 6,
      validations: [],
      appearance: {}
    },
    {
      id: 'address',
      name: 'address',
      type: 'textarea',
      label: 'Address',
      helpText: 'Enter full address',
      disabled: false,
      defaultValue: '',
      value: '',
      readOnly: false,
      width: 6,
      validations: [],
      appearance: {}
    },
    {
      id: 'date-of-birth',
      name: 'dateOfBirth',
      type: 'date',
      label: 'Date of Birth',
      defaultValue: '',
      value: '',
      width: 6,
      transformer: '',
      mode: 'single',
      options: {
        dateFormat: 'yyyy-MM-dd'
      }
    },
    {
      id: 'department',
      name: 'department',
      type: 'select',
      label: 'Department',
      width: 6,
      transformer: '',
      multiple: false,
      value: '',
      options: [
        {
          id: 'option-eng',
          label: 'Engineering',
          value: 'Engineering'
        },
        {
          id: 'option-marketing',
          label: 'Marketing',
          value: 'Marketing'
        },
        {
          id: 'option-sales',
          label: 'Sales',
          value: 'Sales'
        },
        {
          id: 'option-hr',
          label: 'HR',
          value: 'HR'
        }
      ]
    },
    {
      id: 'position',
      name: 'position',
      type: 'text',
      label: 'Position',
      helpText: 'Enter job position',
      disabled: false,
      defaultValue: '',
      value: '',
      readOnly: false,
      width: 6,
      validations: [],
      appearance: {}
    },
    {
      id: 'join-date',
      name: 'joinDate',
      type: 'date',
      label: 'Join Date',
      defaultValue: '',
      value: '',
      width: 6,
      transformer: '',
      mode: 'single',
      options: {
        dateFormat: 'yyyy-MM-dd'
      }
    },
    {
      id: 'submit-btn',
      label: 'Save User',
      type: 'submit',
      width: 3,
      action: 'submit',
      appearance: {
        color: 'primary',
        variant: 'fill',
        size: 'default'
      }
    }
  ]
};

// Presets removed; focusing on simple user form

/**
 * Paints the page to match the current theme.
 *
 * The library deliberately scopes its theme class to its own subtree and never
 * touches the document element, so that an embedded form builder cannot fight
 * the host application's theme. The flip side is that painting the page is the
 * host's job — this is the small piece of integration a real consumer writes,
 * reproduced here so the demo exercises it.
 */
function useBodyTheme() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const { classList } = document.body;

    classList.toggle('app-theme-dark', resolvedTheme === 'dark');
    classList.toggle('app-theme-light', resolvedTheme === 'light');

    return () => classList.remove('app-theme-dark', 'app-theme-light');
  }, [resolvedTheme]);
}

/**
 * Theme controls and a live readout of the theme state.
 *
 * The readout is the point of this bar: `mode` and `resolvedTheme` differ
 * whenever the mode is `system`, and only seeing both makes it obvious whether
 * the OS preference is being followed or an explicit choice is in force.
 */
function ThemeBar() {
  const { mode, resolvedTheme, setMode } = useTheme();

  return (
    <div className="theme-bar">
      <span className="theme-bar__label">Theme</span>
      <button className="btn btn--primary" onClick={() => setMode(nextThemeMode(mode))}>
        {mode === 'light' ? '☀️ Light' : mode === 'dark' ? '🌙 Dark' : '🖥️ System'}
      </button>

      <span className="theme-bar__label">
        mode <span className="theme-bar__value">{mode}</span>
      </span>
      <span className="theme-bar__label">
        resolved <span className="theme-bar__value">{resolvedTheme}</span>
      </span>

      <span className="theme-bar__spacer" />

      <span className="theme-bar__label">
        Persisted under the <span className="theme-bar__value">theme</span> key — reload to confirm it sticks.
      </span>
    </div>
  );
}

/** Which half of the product is on screen. */
type View = 'form' | 'editor';

/**
 * Switches between designing the form and filling it in.
 *
 * These are two views rather than two panes because the core store is a
 * module-level singleton — one page hosts one form. Mounting `FormEditor` and
 * `FormRenderer` together makes them share a single schema, form data and mode,
 * so they have to take turns.
 */
function ViewSwitch({ view, onChange }: { view: View; onChange: (next: View) => void }) {
  const tabs: Array<{ id: View; label: string }> = [
    { id: 'form', label: 'Fill form' },
    { id: 'editor', label: 'Design form' }
  ];

  return (
    <div className="view-switch" role="tablist" aria-label="Demo view">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={view === tab.id}
          className={`view-switch__tab${view === tab.id ? ' view-switch__tab--active' : ''}`}
          onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function ProductionDemo() {
  useBodyTheme();

  // Schema state comes from the editor; runtimeSchema is used by renderer with current values
  const [schema, setSchema] = useState<FormSchema>(initialUserSchema);
  const [view, setView] = useState<View>('form');

  // Users list & editing state
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Record<string, any> | null>(null);

  const userColumns = useMemo(() => {
    return schema.fields.filter((f) => f.type !== 'submit');
  }, [schema]);

  // In this demo we don't expose the editor; schema updates could be handled here if needed.

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('http://localhost:4000/users');
      if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    // const id = setInterval(fetchUsers, 4000);
    // return () => clearInterval(id);
  }, [fetchUsers]);

  const handleSubmitSchema = async (data: Record<string, any>) => {
    try {
      const url = editingUser ? `http://localhost:4000/users/${editingUser.id}` : 'http://localhost:4000/users';
      const method = editingUser ? 'PUT' : 'POST';
      const payload = editingUser ? { ...editingUser, ...data } : data;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      await fetchUsers();
      // reset form to blank state and editing
      setEditingUser(null);
      setSchema({
        ...initialUserSchema,
        fields: initialUserSchema.fields.map((f) => (f.type === 'submit' ? { ...f, label: 'Save User' } : f))
      });
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user. Make sure JSON Server is running on port 4000.');
    }
  };

  return (
    <div>
      <h1>🚀 Parama Form Builder - Users</h1>
      <p>
        Manage users stored in JSON Server (`users` collection). Use the theme control to check the editor, the
        renderer, their portalled overlays and this page's own chrome in both colour schemes.
      </p>

      <ThemeBar />
      <ViewSwitch view={view} onChange={setView} />

      {view === 'editor' ? (
        /*
         * `theme` and `onThemeChange` are deliberately not passed. `FormEditor`
         * forwards them to its own `ThemeProvider`, and a provider that finds an
         * outer one renders its children unchanged — so under this page's
         * provider both props are inert. The editor's toolbar toggle still
         * works: it reaches the outer provider through context, which is why it
         * and the control above stay in step instead of disagreeing.
         */
        <div className="demo-container editor-view">
          <FormEditor schema={schema} onSaveSchema={setSchema} />
        </div>
      ) : (
        <>
          <div className="demo-container">
            {editingUser ? (
              <div className="editing-banner">
                <span>Editing user #{editingUser.id}</span>
                <button
                  className="btn"
                  onClick={() => {
                    setEditingUser(null);
                    setSchema({
                      ...initialUserSchema,
                      fields: initialUserSchema.fields.map((f) =>
                        f.type === 'submit' ? { ...f, label: 'Save User' } : f
                      )
                    });
                  }}>
                  Cancel
                </button>
              </div>
            ) : null}
            <FormRenderer
              key={`${schema.id}`}
              schema={schema}
              data={editingUser || undefined}
              onSubmit={handleSubmitSchema}
            />
          </div>

          <div className="list-data users">
            <div className="users__header">
              <h2>Users</h2>
              <button className="btn" onClick={fetchUsers}>
                Refresh
              </button>
              {isLoading ? <span className="users__status">Loading...</span> : null}
              {error ? <span className="users__status users__status--error">{error}</span> : null}
            </div>
            <div className="users__scroll">
              <table className="users__table">
                <thead>
                  <tr>
                    <th>ID</th>
                    {userColumns.map((col) => (
                      <th key={col.id}>{(col as any).label ?? (col as any).name}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td className="users__empty" colSpan={userColumns.length + 2}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        {userColumns.map((col) => (
                          <td key={col.id}>{String(u[(col as any).name] ?? '')}</td>
                        ))}
                        <td>
                          <button
                            className="btn"
                            onClick={() => {
                              setEditingUser(u);
                              setSchema({
                                ...initialUserSchema,
                                fields: initialUserSchema.fields.map((f) =>
                                  f.type === 'submit' ? { ...f, label: 'Update User' } : f
                                )
                              });
                            }}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Mount the React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);

  /*
   * Wrapping the app in the provider is what a consumer does when more than the
   * form needs theming. `FormRenderer` mounts its own provider when standalone
   * and defers to an outer one, so the form here follows this provider rather
   * than competing with it — which also means this demo exercises that nesting
   * path. Drop the wrapper and pass `theme` straight to `FormRenderer` to test
   * the standalone path instead.
   */
  root.render(
    <ThemeProvider>
      <ProductionDemo />
    </ThemeProvider>
  );
} else {
  console.error('Root container not found');
}
