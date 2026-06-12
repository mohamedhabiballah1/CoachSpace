const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export async function uploadFile(file, type = 'image') {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append(type, file);

  const res = await fetch(`${API_URL}/api/uploads/${type}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Upload failed (${res.status})`);
  return data.url;
}
