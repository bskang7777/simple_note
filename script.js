// Todo 앱 클래스
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    // DOM 요소 초기화
    initializeElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.todoCount = document.getElementById('todoCount');
        this.emptyState = document.getElementById('emptyState');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    // 이벤트 바인딩
    bindEvents() {
        // 할 일 추가
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // 완료된 항목 삭제
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

        // 필터 버튼
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    // 할 일 추가
    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.saveTodos();
        this.render();
        this.todoInput.value = '';
        this.todoInput.focus();
    }

    // 할 일 삭제
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    // 할 일 완료/미완료 토글
    toggleTodo(id) {
        this.todos = this.todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        this.saveTodos();
        this.render();
    }

    // 할 일 수정
    editTodo(id, newText) {
        if (!newText.trim()) return;
        
        this.todos = this.todos.map(todo => 
            todo.id === id ? { ...todo, text: newText.trim() } : todo
        );
        this.saveTodos();
        this.render();
        this.editingId = null;
    }

    // 완료된 항목 삭제
    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
        this.render();
    }

    // 필터 설정
    setFilter(filter) {
        this.currentFilter = filter;
        
        // 필터 버튼 활성화 상태 변경
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    // 필터링된 할 일 목록 가져오기
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    // LocalStorage에 저장
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // 할 일 항목 HTML 생성
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="edit-btn">수정</button>
                <button class="delete-btn">삭제</button>
            </div>
        `;

        // 이벤트 리스너 추가
        const checkbox = li.querySelector('.todo-checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        const todoText = li.querySelector('.todo-text');

        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

        editBtn.addEventListener('click', () => {
            if (this.editingId === todo.id) {
                // 이미 편집 중이면 저장
                const input = li.querySelector('input[type="text"]');
                this.editTodo(todo.id, input.value);
            } else {
                // 편집 모드 시작
                this.startEditing(li, todo);
            }
        });

        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

        return li;
    }

    // 편집 모드 시작
    startEditing(li, todo) {
        this.editingId = todo.id;
        const todoText = li.querySelector('.todo-text');
        const currentText = todoText.textContent;
        
        todoText.innerHTML = `
            <input type="text" value="${this.escapeHtml(currentText)}" 
                   style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
        `;
        
        const input = todoText.querySelector('input');
        input.focus();
        input.select();

        // Enter 키로 저장, Esc 키로 취소
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.editTodo(todo.id, input.value);
            } else if (e.key === 'Escape') {
                this.cancelEditing(li, currentText);
            }
        });

        // 포커스 아웃 시 저장
        input.addEventListener('blur', () => {
            this.editTodo(todo.id, input.value);
        });
    }

    // 편집 취소
    cancelEditing(li, originalText) {
        const todoText = li.querySelector('.todo-text');
        todoText.textContent = originalText;
        this.editingId = null;
    }

    // HTML 이스케이프
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 통계 업데이트
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const active = total - completed;
        
        this.todoCount.textContent = `총 ${total}개 (완료: ${completed}개, 진행중: ${active}개)`;
    }

    // 렌더링
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // 할 일 목록 렌더링
        this.todoList.innerHTML = '';
        filteredTodos.forEach(todo => {
            this.todoList.appendChild(this.createTodoElement(todo));
        });

        // 빈 상태 표시
        if (filteredTodos.length === 0) {
            this.emptyState.classList.add('show');
        } else {
            this.emptyState.classList.remove('show');
        }

        // 통계 업데이트
        this.updateStats();
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
