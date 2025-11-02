// Fetch users on page load
async function loadUsers() {
  const res = await fetch('/api/users');
  const users = await res.json();

  const list = document.getElementById('userList');
  list.innerHTML = '';
  users.forEach(u => {
    const li = document.createElement('li');
    li.textContent = `${u.name} (${u.email})`;
    list.appendChild(li);
  });
}

document.getElementById('userForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  e.target.reset();
  loadUsers();
});

loadUsers();
