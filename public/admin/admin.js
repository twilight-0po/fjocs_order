async function fetchArchive() {
    const res = await fetch('/archive');
    const data = await res.json();
    const list = document.getElementById('order-list');
    list.innerHTML = '';
  
    if (!data) {
      list.innerHTML = '<p>지난 주문이 없습니다.</p>';
      updateSummary(0, 0, '없음');
      return;
    }
  
    const entries = Object.entries(data).sort((a, b) => {
      return new Date(b[1].timestamp) - new Date(a[1].timestamp);
    });
  
    let totalOrders = entries.length;
    let totalItems = 0;
    const menuCount = {};
  
    entries.forEach(([id, order]) => {
      totalItems += order.items.length;
  
      order.items.forEach(item => {
        const name = item.name;
        menuCount[name] = (menuCount[name] || 0) + 1;
      });
  
      const div = document.createElement('div');
      div.className = 'order';
  
      const menuItems = order.items.map(item => `<li>${item.name}</li>`).join('');
  
      div.innerHTML = `
        <h3>🪑 테이블 ${order.table}</h3>
        <p><strong>주문 시간:</strong> ${order.timestamp}</p>
        <p><strong>메뉴:</strong></p>
        <ul class="menu-list">${menuItems}</ul>
      `;
  
      list.appendChild(div);
    });
  
    const mostPopular = Object.entries(menuCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '없음';
  
    updateSummary(totalOrders, totalItems, mostPopular);
  }
  
  function updateSummary(orderCount, itemCount, popularMenu) {
    document.getElementById('order-count').textContent = `전체 주문 수: ${orderCount}`;
    document.getElementById('item-count').textContent = `전체 요리 수: ${itemCount}`;
    document.getElementById('popular-menu').textContent = `인기 메뉴: ${popularMenu}`;
  }
  
  fetchArchive();
  