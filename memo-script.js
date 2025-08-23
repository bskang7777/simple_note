// 인사이트 메모장 클래스
class InsightMemoApp {
    constructor() {
        this.memos = JSON.parse(localStorage.getItem('insightMemos')) || [];
        this.currentFilter = 'all';
        this.currentView = 'grid';
        this.currentSort = 'date-desc';
        this.searchQuery = '';
        this.editingMemo = null;
        this.tags = new Set();
        
        this.initializeElements();
        this.bindEvents();
        this.loadTags();
        this.render();
        this.updateStats();
    }

    // DOM 요소 초기화
    initializeElements() {
        // 사이드바 요소들
        this.newMemoBtn = document.getElementById('newMemoBtn');
        this.searchInput = document.getElementById('searchInput');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.tagsList = document.getElementById('tagsList');
        this.totalMemos = document.getElementById('totalMemos');
        this.totalWords = document.getElementById('totalWords');
        this.avgLength = document.getElementById('avgLength');

        // 메인 콘텐츠 요소들
        this.currentViewEl = document.getElementById('currentView');
        this.memoCount = document.getElementById('memoCount');
        this.viewBtns = document.querySelectorAll('.view-btn');
        this.sortSelect = document.getElementById('sortSelect');
        this.memosContainer = document.getElementById('memosContainer');
        this.emptyState = document.getElementById('emptyState');
        this.emptyNewMemoBtn = document.getElementById('emptyNewMemoBtn');

        // 모달 요소들
        this.memoModal = document.getElementById('memoModal');
        this.memoTitle = document.getElementById('memoTitle');
        this.memoContent = document.getElementById('memoContent');
        this.tagsInput = document.getElementById('tagsInput');
        this.memoTags = document.getElementById('memoTags');
        this.saveMemoBtn = document.getElementById('saveMemoBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.toggleImportant = document.getElementById('toggleImportant');
        this.toggleFavorite = document.getElementById('toggleFavorite');

        // 인사이트 모달
        this.insightsModal = document.getElementById('insightsModal');
        this.closeInsightsBtn = document.getElementById('closeInsightsBtn');
    }

    // 이벤트 바인딩
    bindEvents() {
        // 새 메모 버튼
        this.newMemoBtn.addEventListener('click', () => this.openMemoModal());
        this.emptyNewMemoBtn.addEventListener('click', () => this.openMemoModal());

        // 검색
        this.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });

        // 필터 버튼
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // 뷰 버튼
        this.viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setView(e.target.dataset.view);
            });
        });

        // 정렬
        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });

        // 모달 이벤트
        this.saveMemoBtn.addEventListener('click', () => this.saveMemo());
        this.closeModalBtn.addEventListener('click', () => this.closeMemoModal());
        this.toggleImportant.addEventListener('click', () => this.toggleMemoImportant());
        this.toggleFavorite.addEventListener('click', () => this.toggleMemoFavorite());

        // 태그 입력
        this.tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag();
            }
        });

        // 인사이트 모달
        this.closeInsightsBtn.addEventListener('click', () => this.closeInsightsModal());

        // 모달 외부 클릭으로 닫기
        this.memoModal.addEventListener('click', (e) => {
            if (e.target === this.memoModal) this.closeMemoModal();
        });

        this.insightsModal.addEventListener('click', (e) => {
            if (e.target === this.insightsModal) this.closeInsightsModal();
        });

        // 키보드 단축키
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.openMemoModal();
                        break;
                    case 's':
                        if (this.editingMemo) {
                            e.preventDefault();
                            this.saveMemo();
                        }
                        break;
                    case 'f':
                        e.preventDefault();
                        this.searchInput.focus();
                        break;
                }
            }
            if (e.key === 'Escape') {
                this.closeMemoModal();
                this.closeInsightsModal();
            }
        });
    }

    // 메모 모달 열기
    openMemoModal(memo = null) {
        this.editingMemo = memo;
        
        if (memo) {
            this.memoTitle.value = memo.title;
            this.memoContent.value = memo.content;
            this.renderMemoTags(memo.tags || []);
            this.updateToolbarButtons(memo);
        } else {
            this.memoTitle.value = '';
            this.memoContent.value = '';
            this.renderMemoTags([]);
            this.updateToolbarButtons({ important: false, favorite: false });
        }
        
        this.memoModal.classList.add('show');
        this.memoTitle.focus();
    }

    // 메모 모달 닫기
    closeMemoModal() {
        this.memoModal.classList.remove('show');
        this.editingMemo = null;
    }

    // 메모 저장
    saveMemo() {
        const title = this.memoTitle.value.trim();
        const content = this.memoContent.value.trim();
        const tags = Array.from(this.memoTags.querySelectorAll('.memo-tag-item'))
            .map(tag => tag.textContent.replace('×', '').trim());

        if (!title && !content) return;

        const memoData = {
            id: this.editingMemo ? this.editingMemo.id : Date.now(),
            title: title || '제목 없음',
            content,
            tags,
            important: this.toggleImportant.classList.contains('active'),
            favorite: this.toggleFavorite.classList.contains('active'),
            createdAt: this.editingMemo ? this.editingMemo.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            wordCount: this.countWords(content)
        };

        if (this.editingMemo) {
            const index = this.memos.findIndex(m => m.id === this.editingMemo.id);
            this.memos[index] = memoData;
        } else {
            this.memos.unshift(memoData);
        }

        this.saveMemos();
        this.loadTags();
        this.render();
        this.updateStats();
        this.closeMemoModal();
    }

    // 메모 삭제
    deleteMemo(id) {
        if (confirm('정말로 이 메모를 삭제하시겠습니까?')) {
            this.memos = this.memos.filter(memo => memo.id !== id);
            this.saveMemos();
            this.loadTags();
            this.render();
            this.updateStats();
        }
    }

    // 중요 표시 토글
    toggleMemoImportant() {
        this.toggleImportant.classList.toggle('active');
        this.toggleImportant.innerHTML = this.toggleImportant.classList.contains('active') 
            ? '<i class="fas fa-star"></i>' 
            : '<i class="far fa-star"></i>';
    }

    // 즐겨찾기 토글
    toggleMemoFavorite() {
        this.toggleFavorite.classList.toggle('active');
        this.toggleFavorite.innerHTML = this.toggleFavorite.classList.contains('active') 
            ? '<i class="fas fa-heart"></i>' 
            : '<i class="far fa-heart"></i>';
    }

    // 태그 추가
    addTag() {
        const tag = this.tagsInput.value.trim();
        if (tag && !this.hasTag(tag)) {
            const tags = Array.from(this.memoTags.querySelectorAll('.memo-tag-item'))
                .map(tag => tag.textContent.replace('×', '').trim());
            tags.push(tag);
            this.renderMemoTags(tags);
            this.tagsInput.value = '';
        }
    }

    // 태그 제거
    removeTag(tagElement) {
        tagElement.remove();
    }

    // 태그 존재 확인
    hasTag(tag) {
        return Array.from(this.memoTags.querySelectorAll('.memo-tag-item'))
            .some(tagEl => tagEl.textContent.replace('×', '').trim() === tag);
    }

    // 메모 태그 렌더링
    renderMemoTags(tags) {
        this.memoTags.innerHTML = tags.map(tag => `
            <span class="memo-tag-item">
                ${tag}
                <span class="remove-tag" onclick="this.parentElement.remove()">×</span>
            </span>
        `).join('');
    }

    // 툴바 버튼 업데이트
    updateToolbarButtons(memo) {
        this.toggleImportant.classList.toggle('active', memo.important);
        this.toggleImportant.innerHTML = memo.important 
            ? '<i class="fas fa-star"></i>' 
            : '<i class="far fa-star"></i>';
        
        this.toggleFavorite.classList.toggle('active', memo.favorite);
        this.toggleFavorite.innerHTML = memo.favorite 
            ? '<i class="fas fa-heart"></i>' 
            : '<i class="far fa-heart"></i>';
    }

    // 필터 설정
    setFilter(filter) {
        this.currentFilter = filter;
        
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    // 뷰 설정
    setView(view) {
        this.currentView = view;
        
        this.viewBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        this.memosContainer.classList.toggle('list-view', view === 'list');
        this.render();
    }

    // 필터링된 메모 가져오기
    getFilteredMemos() {
        let filtered = this.memos;

        // 검색 필터
        if (this.searchQuery) {
            filtered = filtered.filter(memo => 
                memo.title.toLowerCase().includes(this.searchQuery) ||
                memo.content.toLowerCase().includes(this.searchQuery) ||
                memo.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
            );
        }

        // 상태 필터
        switch (this.currentFilter) {
            case 'important':
                filtered = filtered.filter(memo => memo.important);
                break;
            case 'recent':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                filtered = filtered.filter(memo => new Date(memo.updatedAt) > weekAgo);
                break;
            case 'favorites':
                filtered = filtered.filter(memo => memo.favorite);
                break;
        }

        // 정렬
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'date-asc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'date-desc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'length':
                    return b.wordCount - a.wordCount;
                case 'importance':
                    return (b.important ? 1 : 0) - (a.important ? 1 : 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }

    // 메모 카드 생성
    createMemoCard(memo) {
        const card = document.createElement('div');
        card.className = `memo-card ${memo.important ? 'important' : ''} ${memo.favorite ? 'favorite' : ''}`;
        card.dataset.id = memo.id;

        const date = new Date(memo.updatedAt);
        const formattedDate = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        card.innerHTML = `
            <div class="memo-header">
                <div>
                    <div class="memo-title">${this.escapeHtml(memo.title)}</div>
                    <div class="memo-date">${formattedDate}</div>
                </div>
                <div class="memo-actions">
                    <button class="memo-action-btn" onclick="memoApp.openMemoModal(${JSON.stringify(memo).replace(/"/g, '&quot;')})" title="편집">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="memo-action-btn" onclick="memoApp.deleteMemo(${memo.id})" title="삭제">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="memo-content">${this.escapeHtml(memo.content.substring(0, 150))}${memo.content.length > 150 ? '...' : ''}</div>
            <div class="memo-tags">
                ${memo.tags.map(tag => `<span class="memo-tag">${this.escapeHtml(tag)}</span>`).join('')}
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.memo-actions')) {
                this.openMemoModal(memo);
            }
        });

        return card;
    }

    // 태그 로드
    loadTags() {
        this.tags.clear();
        this.memos.forEach(memo => {
            memo.tags.forEach(tag => this.tags.add(tag));
        });
        this.renderTags();
    }

    // 태그 렌더링
    renderTags() {
        this.tagsList.innerHTML = Array.from(this.tags).map(tag => `
            <span class="tag-item" onclick="memoApp.filterByTag('${tag}')">${this.escapeHtml(tag)}</span>
        `).join('');
    }

    // 태그로 필터링
    filterByTag(tag) {
        this.searchQuery = tag;
        this.searchInput.value = tag;
        this.setFilter('all');
        this.render();
    }

    // 통계 업데이트
    updateStats() {
        const totalMemos = this.memos.length;
        const totalWords = this.memos.reduce((sum, memo) => sum + memo.wordCount, 0);
        const avgLength = totalMemos > 0 ? Math.round(totalWords / totalMemos) : 0;

        this.totalMemos.textContent = totalMemos;
        this.totalWords.textContent = totalWords;
        this.avgLength.textContent = avgLength;
    }

    // 단어 수 계산
    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    // 인사이트 모달 열기
    openInsightsModal() {
        this.updateInsights();
        this.insightsModal.classList.add('show');
    }

    // 인사이트 모달 닫기
    closeInsightsModal() {
        this.insightsModal.classList.remove('show');
    }

    // 인사이트 업데이트
    updateInsights() {
        // 작성 패턴 분석
        const hourCounts = {};
        this.memos.forEach(memo => {
            const hour = new Date(memo.createdAt).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        
        const peakHour = Object.entries(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b, 0);
        const peakTime = `${peakHour}:00-${peakHour + 1}:00`;
        
        const avgLength = this.memos.length > 0 
            ? Math.round(this.memos.reduce((sum, memo) => sum + memo.wordCount, 0) / this.memos.length)
            : 0;

        // 태그 분석
        const tagCounts = {};
        this.memos.forEach(memo => {
            memo.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        const topTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tag, count]) => tag)
            .join(', ');

        // 주간 통계
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyCount = this.memos.filter(memo => new Date(memo.createdAt) > weekAgo).length;
        const importantCount = this.memos.filter(memo => memo.important).length;

        // 인사이트 업데이트
        document.getElementById('peakTime').textContent = peakTime;
        document.getElementById('avgMemoLength').textContent = `${avgLength}단어`;
        document.getElementById('mainTopics').textContent = topTags || '없음';
        document.getElementById('weeklyCount').textContent = weeklyCount;
        document.getElementById('importantCount').textContent = importantCount;

        // 태그 클라우드
        const tagCloud = document.getElementById('tagCloud');
        tagCloud.innerHTML = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag, count]) => {
                const size = Math.max(0.8, Math.min(2, 1 + count / Math.max(...Object.values(tagCounts))));
                return `<span class="tag-item" style="font-size: ${size}em;">${this.escapeHtml(tag)}</span>`;
            })
            .join('');
    }

    // HTML 이스케이프
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // LocalStorage에 저장
    saveMemos() {
        localStorage.setItem('insightMemos', JSON.stringify(this.memos));
    }

    // 렌더링
    render() {
        const filteredMemos = this.getFilteredMemos();
        
        // 뷰 제목 업데이트
        const filterNames = {
            'all': '전체 메모',
            'important': '중요 메모',
            'recent': '최근 메모',
            'favorites': '즐겨찾기'
        };
        
        this.currentViewEl.textContent = filterNames[this.currentFilter];
        this.memoCount.textContent = `${filteredMemos.length}개의 메모`;

        // 메모 카드 렌더링
        this.memosContainer.innerHTML = '';
        filteredMemos.forEach(memo => {
            this.memosContainer.appendChild(this.createMemoCard(memo));
        });

        // 빈 상태 표시
        if (filteredMemos.length === 0) {
            this.emptyState.classList.add('show');
        } else {
            this.emptyState.classList.remove('show');
        }
    }
}

// 앱 초기화
let memoApp;
document.addEventListener('DOMContentLoaded', () => {
    memoApp = new InsightMemoApp();
});
