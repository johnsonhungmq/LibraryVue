<script setup>
import { ref, onMounted, computed } from "vue";
import { getBorrowingHistory } from "@/services/BorrowService";
import { useRouter } from "vue-router"; // 導入 useRouter 導航
import { useAuthStore } from "@/stores/auth.module"; // 假設有 useAuthStore

// 狀態
const borrowingRecords = ref([]);
const isLoading = ref(true);
const currentPage = ref(1); // 當前頁碼
const itemsPerPage = 10; // 每頁顯示的筆數
const authStore = useAuthStore();
const router = useRouter();

// 取得借閱歷史
const fetchBorrowingHistory = async () => {
  try {
    if (!authStore.loggedIn) {
      throw new Error("請先登入");
    }
    const response = await getBorrowingHistory();
    console.log(response.data);
    borrowingRecords.value = response.data; // 假設後端返回 List<BorrowingRecord>
  } catch (error) {
    console.error("無法取得借閱歷史", error);
    if (error.message === "請先登入") {
      alert("請先登入以查看借閱歷史");
      router.push("/signin");
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchBorrowingHistory);

// 確認還書
const confirmReturn = async (record) => {
  try {
    const response = await fetch(`http://localhost:8080/api/borrow/return/${record.inventory.inventoryId}`, {
      method: 'POST',
      credentials: 'include', // 確保帶上 cookie
    });
    const result = await response.text();
    alert(result); // 顯示後端返回的訊息
    fetchBorrowingHistory(); // 刷新借閱歷史
  } catch (error) {
    alert('還書失敗，請稍後再試');
    console.error('還書失敗', error);
  }
};

// 計算當前頁的資料
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return borrowingRecords.value.slice(start, end);
});

// 總頁數
const totalPages = computed(() => Math.ceil(borrowingRecords.value.length / itemsPerPage));

// 切換頁面
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
</script>

<template>
  <div class="container">
    <h2 class="title">📖 我的借閱歷史</h2>

    <!-- 左上角分頁按鈕 -->
    <div v-if="borrowingRecords.length > itemsPerPage" class="pagination top-left">
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
          <th>書籍名稱</th>
          <th>借閱時間</th>
          <th>還書時間</th>
          <th>狀態</th>
          <th>操作</th> 
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in paginatedRecords" :key="record.id" class="table-row">
          <td>{{ record.inventory.book.name }}</td>
          <td>{{ formatDate(record.borrowingTime) }}</td>
          <td>{{ record.returnTime ? formatDate(record.returnTime) : '尚未還書' }}</td>
          <td>{{ record.returnTime ? '已還書' : '尚未還書' }}</td>
          <td v-if="!record.returnTime"> <!-- 僅在尚未還書時顯示還書按鈕 -->
            <button @click="confirmReturn(record)" class="return-btn">還書</button>
          </td>
          <td v-else>-</td>
        </tr>
      </tbody>
    </table>

    <div v-if="borrowingRecords.length === 0 && !isLoading" class="no-records">
      目前沒有借閱歷史。
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
  background-color: #f9f9f9; 
}

.table-row:nth-child(even) {
  background-color: #ffffff; 
}

.table-row:hover {
  background-color: #f5f8fa; 
  cursor: pointer;
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
  background: rgba(255, 255, 255, 0.9); 
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
  transform: translateY(-2px); 
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
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3); 
  transform: scale(1.05); 
}

/* 還書按鈕 */
.return-btn {
  background-color: #e74c3c; 
  color: white; 
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.return-btn:hover {
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

  .return-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 5px;
  }

  .top-left, .bottom-right {
    position: static; 
    width: 100%;
    margin-top: 10px;
    text-align: center;
    background: rgba(255, 255, 255, 0.9);
  }

  .page-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>

<script>
function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
</script>