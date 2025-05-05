async function fetchOrders() {
    const res = await fetch('/orders');
    const data = await res.json();
    const list = document.getElementById('order-list');
    list.innerHTML = '';
  
    if (!data) return;
  
    Object.entries(data).forEach(([orderId, order]) => {
      const servedAll = order.items.every(item => item.status === 'served');
      if (servedAll) return;
  
      const div = document.createElement('div');
      div.className = 'order';
  
      const itemsHTML = order.items
  .map((item, idx) => {
    if (item.status !== 'cook_done') return ''; // ❗ cook_done만 표시
    return `<button class="menu-item cook_done" onclick="serveItem('${orderId}', ${idx})">${item.name} 🍽️</button>`;
  })
  .filter(html => html !== '')  // ❗ cook_done이 하나도 없으면 빈 배열 방지
  .join('');
  if (!itemsHTML) return;  // ❗ 이 주문에 cook_done이 없다면 아예 건너뜀

div.innerHTML = `
  <div class="order-title">🪑 테이블 ${order.table}</div>
  <div class="menu-list">${itemsHTML}</div>
`;
  
  
      list.appendChild(div);
    });
  }
  
  async function serveItem(orderId, itemIndex) {
    const button = event.target;
    button.disabled = true; // ✅ 중복 클릭 방지
  
    try {
      const res = await fetch('/orders');
      const data = await res.json();
  
      data[orderId].items[itemIndex].status = 'done';
  
      await fetch(`/orders/${orderId}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: data[orderId].items })
      });
  
      fetchOrders();
    } catch (error) {
      console.error(error);
      button.disabled = false; // 실패 시 다시 클릭 가능
    }
  }
  
  
  
  fetchOrders();
  setInterval(fetchOrders, 5000);
  