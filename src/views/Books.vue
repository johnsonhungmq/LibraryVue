<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router"; // 引入 Vue Router
import { getAllBorrowRecords } from "@/services/BorrowService";

// 狀態
const borrowRecords = ref([]);
const isLoading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 10;
const showConfirmModal = ref(false);
const selectedRecord = ref(null);

// 初始化 Vue Router
const router = useRouter();

// 取得所有館藏圖書
const fetchBorrowRecords = async () => {
  try {
    const response = await getAllBorrowRecords();
    console.log(response.data);
    borrowRecords.value = response.data;
  } catch (error) {
    console.error("無法取得館藏圖書", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchBorrowRecords);

// 顯示確認借閱的模態框
const showBorrowConfirm = (record) => {
  selectedRecord.value = record;
  showConfirmModal.value = true;
};

// 確認借閱，並在成功後跳轉到 history 頁面
const confirmBorrow = async () => {
  if (selectedRecord.value) {
    try {
      const response = await fetch(`http://localhost:8080/api/borrow/${selectedRecord.value.inventoryId}`, {
        method: "POST",
        credentials: "include",
      });
      const result = await response.text();
      alert(result); // 顯示後端返回的訊息
      fetchBorrowRecords(); // 刷新館藏圖書
      // 借閱成功後跳轉到 history 頁面
      router.push("/history"); // 假設 history 頁面的路由是 /history
    } catch (error) {
      alert("借閱失敗，請稍後再試");
      console.error("借閱失敗", error);
    } finally {
      showConfirmModal.value = false;
      selectedRecord.value = null;
    }
  }
};

// 取消借閱
const cancelBorrow = () => {
  showConfirmModal.value = false;
  selectedRecord.value = null;
};

// 計算當前頁的資料
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return borrowRecords.value.slice(start, end);
});

// 總頁數
const totalPages = computed(() => Math.ceil(borrowRecords.value.length / itemsPerPage));

// 切換頁面
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
</script>

<template>
  <div class="container">
    <h2 class="title">📖 館藏圖書</h2>

    <!-- 左上角分頁按鈕 -->
    <div v-if="borrowRecords.length > itemsPerPage" class="pagination top-left">
      <button 
        @click="changePage(currentPage.value - 1)" 
        :disabled="currentPage.value === 1" 
        class="page-btn"
      >
        上一頁
      </button>
      <button 
        v-for="page in totalPages" 
        :key="page" 
        @click="changePage(page)" 
        :class="{ 'active': currentPage.value === page }" 
        class="page-btn"
      >
        {{ page }}
      </button>
      <button 
        @click="changePage(currentPage.value + 1)" 
        :disabled="currentPage.value === totalPages" 
        class="page-btn"
      >
        下一頁
      </button>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      載入中...
    </div>

    <table v-else class="borrow-table">
      <thead>
        <tr>
          <th>架號</th>
          <th>書籍名稱</th>
          <th>作者名稱</th>
          <th>ISBN</th>
          <th>描述</th>
          <th>庫存狀態</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in paginatedRecords" :key="record.id" class="table-row">
          <td>{{ record.inventoryId }}</td>
          <td>{{ record.book.name }}</td>
          <td>{{ record.book.author }}</td>
          <td>{{ record.book.isbn }}</td>
          <td>{{ record.book.introduction }}</td>
          <td>{{ record.status }}</td>
          <td v-if="record.status === 'AVAILABLE'">
            <button @click="showBorrowConfirm(record)" class="borrow-btn">借閱</button>
          </td>
          <td v-else class="unavailable-text">無法借閱</td>
        </tr>
      </tbody>
    </table>

    <div v-if="borrowRecords.length === 0 && !isLoading" class="no-records">
      目前沒有館藏圖書。
    </div>

    <!-- 借閱確認模態框 -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal-content">
        <h3>確認借閱</h3>
        <p>您確定要借閱書籍「{{ selectedRecord?.book.name }}」嗎？</p>
        <div class="modal-actions">
          <button @click="confirmBorrow" class="modal-btn confirm-btn">確認</button>
          <button @click="cancelBorrow" class="modal-btn cancel-btn">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 容器樣式 */
.container {
  width: 90%;
  max-width: 1200px;
  margin: 40px auto;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: transparent; /* 移除背景 */
  position: relative; /* 確保子元素定位相對於容器 */
}

/* 標題 */
.title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 25px;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

/* 載入中樣式 */
.loading {
  text-align: center;
  font-size: 18px;
  color: #7f8c8d;
  padding: 20px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #3498db;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 10px;
  vertical-align: middle;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 表格樣式 */
.borrow-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: transparent; /* 移除表格背景 */
  border-radius: 8px;
  overflow: hidden;
}

.borrow-table th,
.borrow-table td {
  padding: 15px;
  text-align: center;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.borrow-table th {
  background-color: #3498db;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-row {
  transition: background-color 0.3s ease;
}

/* 交錯背景顏色 */
.table-row:nth-child(odd) {
  background-color: #f9f9f9; /* 奇數行 */
}

.table-row:nth-child(even) {
  background-color: #ffffff; /* 偶數行 */
}

.table-row:hover {
  background-color: #f5f8fa; /* 懸停效果覆蓋交錯顏色 */
  cursor: pointer;
}

/* 借閱按鈕 */
.borrow-btn {
  background-color: #42b983;
  color: white; /* 白色文字 */
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.borrow-btn:hover {
  background-color: #3498db;
}

/* 無法借閱文字樣式 */
.unavailable-text {
  color: #e74c3c; /* 使用紅色提示無法借閱 */
  font-size: 14px;
  font-weight: 500;
}

/* 無紀錄提示 */
.no-records {
  text-align: center;
  color: #7f8c8d;
  font-size: 16px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

/* 分頁樣式 */
.pagination {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9); /* 半透明白背景 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.top-left {
  position: absolute;
  top: 20px;
  left: 20px;
}

.bottom-right {
  position: absolute;
  bottom: 20px;
  right: 20px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ccc;
  background: #f1f1f1;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #ddd;
  color: #2c3e50;
  transform: translateY(-2px); /* 輕微抬升效果 */
}

.page-btn:disabled {
  background: #f1f1f1;
  cursor: not-allowed;
  color: #999;
  opacity: 0.7;
}

.page-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3); /* 藍色陰影 */
  transform: scale(1.05); /* 輕微放大效果 */
}

/* 借閱確認模態框樣式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明遮罩 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 300px;
  text-align: center;
}

.modal-content h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.modal-content p {
  color: #34495e;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.modal-btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.confirm-btn {
  background-color: #42b983;
  color: white; /* 白色文字 */
}

.confirm-btn:hover {
  background-color: #3498db;
}

.cancel-btn {
  background-color: #e74c3c;
  color: white; /* 白色文字 */
}

.cancel-btn:hover {
  background-color: #c0392b;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .container {
    width: 85%;
    padding: 20px;
  }

  .title {
    font-size: 22px;
  }

  .borrow-table th,
  .borrow-table td {
    padding: 10px;
    font-size: 12px;
  }

  .borrow-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .unavailable-text {
    font-size: 12px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 5px;
  }

  .top-left, .bottom-right {
    position: static; /* 在小螢幕上移除絕對定位 */
    width: 100%;
    margin-top: 10px;
    text-align: center;
    background: rgba(255, 255, 255, 0.9);
  }

  .page-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .modal-content {
    width: 250px;
  }

  .modal-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>