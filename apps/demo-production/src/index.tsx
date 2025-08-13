import './index.css';
import '@parama-ui/react/dist/parama-ui.min.css';
import '@parama-dev/form-builder-editor/dist/editor.css'; // Ensure editor styles are included
import { createRoot } from 'react-dom/client';
import type { FormField, FormSchema } from '@parama-dev/form-builder-types';
import { FormRenderer } from '@parama-dev/form-builder-renderer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormEditor } from '@parama-dev/form-builder-editor';

// User information schema for JSON Server `users` resource
const initialUserSchema: FormSchema = {
  id: 'user-form',
  version: '1.0.0',
  title: 'User Information',
  description: 'Capture basic user details',
  layout: {
    colSize: 12,
    gap: 5
  },
  fields: [
    {
      id: "first-name",
      name: "firstName",
      type: "text",
      label: "First Name",
      helpText: "Enter first name",
      disabled: false,
      defaultValue: "",
      value: "",
      readOnly: false,
      width: 6,
      validations: [
        {
          trigger: "change",
          type: "required",
          message: "First name is required"
        }
      ],
      appearance: {}
    },
    {
      id: "last-name",
      name: "lastName",
      type: "text",
      label: "Last Name",
      helpText: "Enter last name",
      disabled: false,
      defaultValue: "",
      value: "",
      readOnly: false,
      width: 6,
      validations: [
        {
          trigger: "change",
          type: "required",
          message: "Last name is required"
        }
      ],
      appearance: {}
    },
    {
      id: "phone",
      name: "phone",
      type: "text",
      label: "Phone",
      helpText: "Enter phone number",
      disabled: false,
      defaultValue: "",
      value: "",
      readOnly: false,
      width: 6,
      validations: [],
      appearance: {}
    },
    {
      id: "email",
      name: "email",
      type: "email",
      label: "Email",
      helpText: "Enter email address",
      disabled: false,
      defaultValue: "",
      value: "",
      readOnly: false,
      width: 6,
      validations: [
        {
          trigger: "change",
          type: "required",
          message: "Email is required"
        },
        {
          type: "pattern",
          name: "email",
          message: "Invalid email format",
          trigger: "change",
          value: ""
        }
      ],
      appearance: {}
    },
    {
      id: "date-of-birth",
      name: "dateOfBirth",
      type: "date",
      label: "Date of Birth",
      defaultValue: "",
      value: "",
      width: 12,
      transformer: "",
      mode: "single",
      options: {
        dateFormat: "dd/MM/yyyy"
      }
    },
    {
      id: "field-1755082042102",
      name: "job",
      type: "select",
      label: "Job",
      width: 4,
      transformer: "",
      multiple: false,
      value: "",
      options: [
        {
          id: "option-1755082861797",
          label: "Frontend developer",
          value: "fe"
        },
        {
          id: "option-1755082880399",
          label: "Backend developer",
          value: "be"
        },
        {
          id: "option-1755082890454",
          label: "Fullstack developer",
          value: "full"
        }
      ]
    },
    {
      id: "field-1755082045030",
      name: "colorFav",
      type: "autocomplete",
      label: "Favorite color",
      width: 4,
      transformer: "",
      value: "",
      placeholder: "Search options...",
      shouldFilter: true,
      options: [
        {
          id: "option-1755082045031",
          label: "Red",
          value: "red"
        },
        {
          id: "option-1755082045032",
          label: "Yellow",
          value: "yellow"
        },
        {
          id: "option-1755082045033",
          label: "Green",
          value: "green"
        }
      ]
    },
    {
      id: "field-1755082047230",
      name: "hobby",
      type: "multiselect",
      label: "Hobby",
      value: [],
      multiple: true,
      width: 4,
      transformer: "",
      options: [
        {
          id: "option-1755082971600",
          label: "Swimming",
          value: "swim"
        },
        {
          id: "option-1755085073012",
          label: "Running",
          value: "run"
        },
        {
          id: "option-1755085080748",
          label: "Walking",
          value: "walk"
        }
      ]
    },
    {
      id: "field-1755082050813",
      name: "notification",
      type: "radio",
      value: "",
      label: "Notification",
      width: 6,
      items: [
        {
          id: "field-1755082050814",
          label: "SMS",
          value: "sms"
        },
        {
          id: "field-1755082050815",
          label: "Email",
          value: "email"
        },
        {
          id: "field-1755082050816",
          label: "Whatsapp",
          value: "wa"
        }
      ],
      transformer: ""
    },
    {
      id: "field-1755082064621",
      name: "prefProduct",
      type: "checkbox",
      value: [],
      label: "Prefered product",
      width: 6,
      items: [
        {
          id: "field-1755082064622",
          label: "Smartphone",
          value: "smartphone"
        },
        {
          id: "field-1755082064623",
          label: "Laptop",
          value: "laptop"
        },
        {
          id: "field-1755082064624",
          label: "PC",
          value: "pc"
        }
      ],
      transformer: ""
    },
    {
      id: "field-1755090431972",
      name: "avatar",
      type: "file",
      label: "Avatar",
      value: "",
      width: 12,
      options: {
        multiple: false,
        maxFiles: 5,
        maxSize: 5242880,
        accept: {
          'image/jpeg': [
            ".jpeg",
            ".jpg"
          ],
          'image/png': [
            ".png"
          ]
        },
        instantUpload: false,
        bulkUpload: false,
        server: "http://localhost:4000/users"
      }
    },
    {
      id: "submit-btn",
      label: "Save User",
      type: "submit",
      width: 3,
      action: "submit",
      appearance: {
        color: "primary",
        variant: "fill",
        size: "default"
      }
    }
  ]
};

// Presets removed; focusing on simple user form

function ProductionDemo() {
  // Schema state comes from the editor; runtimeSchema is used by renderer with current values
  const [schema, setSchema] = useState<FormSchema>(initialUserSchema);

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
      alert('Error saving user. Make sure JSON Server is running on port 3000.');
    }
  };


  return (
    <div>
      <h1>🚀 Parama Form Builder - Users</h1>
      <p>Manage users stored in JSON Server (`users` collection). Edit the form schema on the left, render and submit on the right.</p>

      {/* <div className="demo-container">
        <FormEditor schema={schema} onSaveSchema={(s) => setSchema(s)} />
      </div> */}

      <div className="demo-container">
        {editingUser ? (
          <div style={{ marginBottom: 12, padding: '8px 12px', background: '#fff8e1', border: '1px solid #ffe58f', borderRadius: 6 }}>
            Editing user #{editingUser.id}
            <button onClick={() => {
              setEditingUser(null);
              setSchema({
                ...initialUserSchema,
                  fields: initialUserSchema.fields.map((f) => (f.type === 'submit' ? { ...f, label: 'Save User' } : f))
              });
            }} style={{ marginLeft: 12, padding: '4px 8px' }}>Cancel</button>
          </div>
        ) : null}
        <FormRenderer
          key={`${schema.id}-edit`}
          schema={schema}
          data={editingUser || undefined}
          onSubmit={handleSubmitSchema}
        />
      </div>

      <div className="list-data" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Users</h2>
          <button onClick={fetchUsers} style={{ padding: '4px 8px' }}>Refresh</button>
          {isLoading ? <span style={{ fontSize: 12, color: '#666' }}>Loading...</span> : null}
          {error ? <span style={{ fontSize: 12, color: 'crimson' }}>{error}</span> : null}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>ID</th>
                {userColumns.map((col) => (
                  <th key={col.id} style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>{(col as any).label ?? (col as any).name}</th>
                ))}
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={userColumns.length + 2} style={{ padding: 12, color: '#666' }}>No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{u.id}</td>
                    {userColumns.map((col) => (
                      <td key={col.id} style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{String(u[(col as any).name] ?? '')}</td>
                    ))}
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      <button onClick={() => {
                        setEditingUser(u);
                        setSchema({
                          ...initialUserSchema,
                            fields: initialUserSchema.fields.map((f) => (f.type === 'submit' ? { ...f, label: 'Update User' } : f))
                        });
                      }} style={{ padding: '4px 8px' }}>Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Mount the React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<ProductionDemo />);
} else {
  console.error('Root container not found');
}
