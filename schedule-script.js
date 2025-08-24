// 스마트 스케줄러 클래스
class SmartScheduler {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('smartTasks')) || this.getInitialSampleData();
        this.currentDate = new Date();
        this.currentView = 'timeline';
        this.currentFilter = 'all';
        this.editingTask = null;
        this.draggedTask = null;
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    // 초기 샘플 데이터 생성
    getInitialSampleData() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return [
            {
                id: 1,
                title: "팀 미팅",
                description: "주간 프로젝트 진행상황 공유",
                startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000).toISOString(), // 오전 9시
                endTime: new Date(today.getTime() + 10 * 60 * 60 * 1000).toISOString(), // 오전 10시
                category: "work",
                priority: "high",
                repeat: "weekly",
                reminder: "15",
                tags: ["미팅", "프로젝트"],
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                color: "#667eea"
            },
            {
                id: 2,
                title: "점심 약속",
                description: "클라이언트와의 비즈니스 런치",
                startTime: new Date(today.getTime() + 12 * 60 * 60 * 1000).toISOString(), // 오후 12시
                endTime: new Date(today.getTime() + 13 * 60 * 60 * 1000).toISOString(), // 오후 1시
                category: "work",
                priority: "medium",
                repeat: "none",
                reminder: "30",
                tags: ["클라이언트", "점심"],
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                color: "#28a745"
            },
            {
                id: 3,
                title: "운동",
                description: "헬스장에서 유산소 운동",
                startTime: new Date(today.getTime() + 18 * 60 * 60 * 1000).toISOString(), // 오후 6시
                endTime: new Date(today.getTime() + 19 * 60 * 60 * 1000).toISOString(), // 오후 7시
                category: "health",
                priority: "medium",
                repeat: "daily",
                reminder: "none",
                tags: ["운동", "건강"],
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                color: "#fd7e14"
            },
            {
                id: 4,
                title: "코딩 공부",
                description: "React와 TypeScript 학습",
                startTime: new Date(today.getTime() + 20 * 60 * 60 * 1000).toISOString(), // 오후 8시
                endTime: new Date(today.getTime() + 22 * 60 * 60 * 1000).toISOString(), // 오후 10시
                category: "study",
                priority: "high",
                repeat: "daily",
                reminder: "none",
                tags: ["코딩", "React", "TypeScript"],
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                color: "#6f42c1"
            },
            {
                id: 5,
                title: "긴급 보고서 작성",
                description: "CEO에게 제출할 분기별 실적 보고서",
                startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000).toISOString(), // 오후 2시
                endTime: new Date(today.getTime() + 16 * 60 * 60 * 1000).toISOString(), // 오후 4시
                category: "work",
                priority: "urgent",
                repeat: "none",
                reminder: "60",
                tags: ["보고서", "긴급"],
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                color: "#dc3545"
            },
            {
                id: 6,
                title: "친구 생일파티",
                description: "친구 생일 축하 파티",
                startTime: new Date(today.getTime() + 19 * 60 * 60 * 1000).toISOString(), // 오후 7시
                endTime: new Date(today.getTime() + 23 * 60 * 60 * 1000).toISOString(), // 오후 11시
                category: "social",
                priority: "low",
                repeat: "yearly",
                reminder: "1440",
                tags: ["생일", "파티", "친구"],
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                color: "#e83e8c"
            }
        ];
    }

    // DOM 요소 초기화
    initializeElements() {
        // 사이드바 요소들
        this.newTaskBtn = document.getElementById('newTaskBtn');
        this.currentDateEl = document.getElementById('currentDate');
        this.currentDayEl = document.getElementById('currentDay');
        this.prevDayBtn = document.getElementById('prevDay');
        this.nextDayBtn = document.getElementById('nextDay');
        this.todayBtn = document.getElementById('todayBtn');
        this.urgentCount = document.getElementById('urgentCount');
        this.importantCount = document.getElementById('importantCount');
        this.completedCount = document.getElementById('completedCount');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.completionRate = document.getElementById('completionRate');
        this.completionText = document.getElementById('completionText');
        this.avgDelay = document.getElementById('avgDelay');
        this.peakTime = document.getElementById('peakTime');

        // 메인 콘텐츠 요소들
        this.scheduleTitle = document.getElementById('scheduleTitle');
        this.taskCount = document.getElementById('taskCount');
        this.viewBtns = document.querySelectorAll('.view-btn');
        this.insightsBtn = document.getElementById('insightsBtn');
        this.scheduleContainer = document.getElementById('scheduleContainer');
        this.timelineView = document.getElementById('timelineView');
        this.listView = document.getElementById('listView');
        this.calendarView = document.getElementById('calendarView');
        this.weekView = document.getElementById('weekView');
        this.monthView = document.getElementById('monthView');
        this.emptyState = document.getElementById('emptyState');
        this.emptyNewTaskBtn = document.getElementById('emptyNewTaskBtn');

        // 모달 요소들
        this.taskModal = document.getElementById('taskModal');
        this.taskTitle = document.getElementById('taskTitle');
        this.taskDescription = document.getElementById('taskDescription');
        this.taskStartTime = document.getElementById('taskStartTime');
        this.taskEndTime = document.getElementById('taskEndTime');
        this.taskCategory = document.getElementById('taskCategory');
        this.taskRepeat = document.getElementById('taskRepeat');
        this.taskReminder = document.getElementById('taskReminder');
        this.taskTags = document.getElementById('taskTags');
        this.saveTaskBtn = document.getElementById('saveTaskBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.priorityBtns = document.querySelectorAll('.priority-btn');

        // 인사이트 모달
        this.insightsModal = document.getElementById('insightsModal');
        this.closeInsightsBtn = document.getElementById('closeInsightsBtn');
    }

    // 이벤트 바인딩
    bindEvents() {
        // 새 할일 버튼
        this.newTaskBtn.addEventListener('click', () => this.openTaskModal());
        this.emptyNewTaskBtn.addEventListener('click', () => this.openTaskModal());

        // 날짜 네비게이션
        this.prevDayBtn.addEventListener('click', () => this.navigateDate(-1));
        this.nextDayBtn.addEventListener('click', () => this.navigateDate(1));
        this.todayBtn.addEventListener('click', () => this.goToToday());

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

        // 인사이트 버튼
        this.insightsBtn.addEventListener('click', () => this.openInsightsModal());

        // 새로운 뷰들의 네비게이션 버튼
        document.getElementById('prevWeek')?.addEventListener('click', () => this.navigateWeek(-1));
        document.getElementById('nextWeek')?.addEventListener('click', () => this.navigateWeek(1));
        document.getElementById('prevMonthView')?.addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('nextMonthView')?.addEventListener('click', () => this.navigateMonth(1));

        // 모달 이벤트
        this.saveTaskBtn.addEventListener('click', () => this.saveTask());
        this.closeModalBtn.addEventListener('click', () => this.closeTaskModal());
        this.closeInsightsBtn.addEventListener('click', () => this.closeInsightsModal());
        
        // 삭제 및 이메일 버튼
        this.deleteTaskBtn = document.getElementById('deleteTaskBtn');
        this.emailTaskBtn = document.getElementById('emailTaskBtn');
        this.deleteTaskBtn.addEventListener('click', () => this.deleteCurrentTask());
        this.emailTaskBtn.addEventListener('click', () => this.emailCurrentTask());
        
        // 회의록/문서 버튼
        this.addNoteBtn = document.getElementById('addNoteBtn');
        this.attachFileBtn = document.getElementById('attachFileBtn');
        this.meetingNotes = document.getElementById('meetingNotes');
        this.notesList = document.getElementById('notesList');
        
        this.addNoteBtn.addEventListener('click', () => this.addNote());
        this.attachFileBtn.addEventListener('click', () => this.attachFile());

        // 드래그 앤 드롭 이벤트
        this.bindDragAndDropEvents();

        // 우선순위 버튼
        this.priorityBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setPriority(e.target.dataset.priority);
            });
        });

        // 키보드 단축키
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.openTaskModal();
                        break;
                    case 's':
                        if (this.editingTask) {
                            e.preventDefault();
                            this.saveTask();
                        }
                        break;
                    case 'c':
                        if (this.editingTask) {
                            e.preventDefault();
                            this.copyTask();
                        }
                        break;
                    case 'v':
                        e.preventDefault();
                        this.pasteTask();
                        break;
                }
            }
            if (e.key === 'Escape') {
                this.closeTaskModal();
                this.closeInsightsModal();
            }
            if (e.key === 'Delete' && this.editingTask) {
                this.deleteTask(this.editingTask.id);
            }
        });

        // 모달 외부 클릭으로 닫기
        this.taskModal.addEventListener('click', (e) => {
            if (e.target === this.taskModal) this.closeTaskModal();
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
                        this.openTaskModal();
                        break;
                    case 's':
                        if (this.editingTask) {
                            e.preventDefault();
                            this.saveTask();
                        }
                        break;
                    case 'c':
                        if (this.editingTask) {
                            e.preventDefault();
                            this.copyTask();
                        }
                        break;
                    case 'v':
                        e.preventDefault();
                        this.pasteTask();
                        break;
                }
            }
            if (e.key === 'Escape') {
                this.closeTaskModal();
                this.closeInsightsModal();
            }
            if (e.key === 'Delete' && this.editingTask) {
                this.deleteTask(this.editingTask.id);
            }
        });

        // 드래그 앤 드롭 이벤트
        this.bindDragAndDropEvents();

        // 빠른 추가를 위한 더블클릭 이벤트
        this.timelineView.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('time-content') || e.target.classList.contains('time-slot')) {
                this.quickAddTask(e);
            }
        });

        this.weekView.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('week-day-slot')) {
                this.quickAddTask(e);
            }
        });
    }

    // 드래그 앤 드롭 이벤트 바인딩
    bindDragAndDropEvents() {
        // 타임라인 뷰 드래그 앤 드롭
        this.timelineView.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.handleDragOver(e);
        });

        this.timelineView.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleDrop(e);
        });

        // 캘린더 뷰 드래그 앤 드롭
        this.calendarView.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.handleCalendarDragOver(e);
        });

        this.calendarView.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleCalendarDrop(e);
        });

        // 리사이즈 이벤트
        document.addEventListener('mousemove', (e) => {
            if (this.isResizing) {
                this.handleResize(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isResizing) {
                this.isResizing = false;
                this.resizeHandle = null;
            }
        });
    }

    // 드래그 오버 처리 (타임라인)
    handleDragOver(e) {
        const timeSlot = e.target.closest('.time-slot');
        if (timeSlot) {
            timeSlot.classList.add('drag-over');
        }
    }

    // 드롭 처리 (타임라인)
    handleDrop(e) {
        const timeSlot = e.target.closest('.time-slot');
        if (timeSlot && this.draggedTask) {
            const timeLabel = timeSlot.querySelector('.time-label');
            const hour = parseInt(timeLabel.textContent.split(':')[0]);
            
            // 드래그된 할일의 시간 업데이트
            const newStartTime = new Date(this.draggedTask.startTime);
            const newEndTime = new Date(this.draggedTask.endTime);
            const duration = newEndTime.getTime() - newStartTime.getTime();
            
            newStartTime.setHours(hour, 0, 0, 0);
            newEndTime.setTime(newStartTime.getTime() + duration);
            
            this.updateTaskTime(this.draggedTask.id, newStartTime, newEndTime);
        }
        
        // 드래그 오버 스타일 제거
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('drag-over');
        });
        
        this.draggedTask = null;
        this.isDragging = false;
    }

    // 캘린더 드래그 오버 처리
    handleCalendarDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        const calendarDay = e.target.closest('.calendar-day');
        if (calendarDay && this.draggedTask) {
            // 기존 하이라이트 제거
            document.querySelectorAll('.calendar-day.drag-over').forEach(day => {
                day.classList.remove('drag-over');
            });
            calendarDay.classList.add('drag-over');
            
            // 드래그 가능한 날짜인지 확인 (과거 날짜 제외)
            const dayNumber = calendarDay.querySelector('.day-number');
            if (dayNumber) {
                const day = parseInt(dayNumber.textContent);
                const year = this.currentDate.getFullYear();
                const month = this.currentDate.getMonth();
                const targetDate = new Date(year, month, day);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (targetDate < today) {
                    calendarDay.classList.add('drag-disabled');
                } else {
                    calendarDay.classList.remove('drag-disabled');
                }
            }
        }
    }

    // 캘린더 뷰 드롭 처리
    handleCalendarDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const calendarDay = e.target.closest('.calendar-day');
        if (calendarDay && this.draggedTask) {
            const dayNumber = calendarDay.querySelector('.day-number');
            if (dayNumber) {
                const day = parseInt(dayNumber.textContent);
                const year = this.currentDate.getFullYear();
                const month = this.currentDate.getMonth();
                const targetDate = new Date(year, month, day);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // 과거 날짜로 드롭 방지
                if (targetDate < today) {
                    // 에러 피드백
                    calendarDay.style.backgroundColor = '#dc3545';
                    calendarDay.style.transition = 'background-color 0.3s';
                    setTimeout(() => {
                        calendarDay.style.backgroundColor = '';
                        calendarDay.style.transition = '';
                    }, 300);
                    
                    // 알림 메시지
                    this.showNotification('과거 날짜로는 할일을 이동할 수 없습니다.', 'error');
                } else {
                    const currentStartTime = new Date(this.draggedTask.startTime);
                    const currentEndTime = new Date(this.draggedTask.endTime);
                    const duration = currentEndTime.getTime() - currentStartTime.getTime();
                    
                    const newDate = new Date(year, month, day, currentStartTime.getHours(), currentStartTime.getMinutes());
                    const newEndDate = new Date(newDate.getTime() + duration);
                    
                    this.updateTaskTime(this.draggedTask.id, newDate, newEndDate);
                    
                    // 성공 피드백
                    calendarDay.style.backgroundColor = '#28a745';
                    calendarDay.style.transition = 'background-color 0.3s';
                    setTimeout(() => {
                        calendarDay.style.backgroundColor = '';
                        calendarDay.style.transition = '';
                    }, 300);
                    
                    // 성공 알림
                    this.showNotification(`할일이 ${month + 1}월 ${day}일로 이동되었습니다.`, 'success');
                }
            }
        }
        
        // 드래그 상태 정리
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('drag-over', 'drag-disabled');
        });
        
        this.draggedTask = null;
    }

    // 리사이즈 처리
    handleResize(e) {
        if (!this.resizeHandle || !this.draggedTask) return;
        
        const rect = this.resizeHandle.getBoundingClientRect();
        const deltaY = e.clientY - rect.bottom;
        const deltaMinutes = Math.round(deltaY / 2); // 2px = 1분
        
        const task = this.tasks.find(t => t.id === this.draggedTask.id);
        if (task) {
            const newEndTime = new Date(task.endTime);
            newEndTime.setMinutes(newEndTime.getMinutes() + deltaMinutes);
            
            if (newEndTime > new Date(task.startTime)) {
                task.endTime = newEndTime.toISOString();
                this.saveTasks();
                this.render();
            }
        }
    }

    // 할일 시간 업데이트
    updateTaskTime(taskId, newStartTime, newEndTime) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.startTime = newStartTime.toISOString();
            task.endTime = newEndTime.toISOString();
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    // 할일 복사
    copyTask() {
        if (this.editingTask) {
            localStorage.setItem('copiedTask', JSON.stringify(this.editingTask));
        }
    }

    // 할일 붙여넣기
    pasteTask() {
        const copiedTask = localStorage.getItem('copiedTask');
        if (copiedTask) {
            const task = JSON.parse(copiedTask);
            task.id = Date.now();
            task.startTime = new Date().toISOString();
            task.endTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1시간 후
            task.createdAt = new Date().toISOString();
            task.updatedAt = new Date().toISOString();
            
            this.tasks.push(task);
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    // 일정 충돌 감지
    detectConflicts(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return [];
        
        const conflicts = this.tasks.filter(t => 
            t.id !== taskId && 
            !t.completed &&
            new Date(t.startTime) < new Date(task.endTime) &&
            new Date(t.endTime) > new Date(task.startTime)
        );
        
        return conflicts;
    }

    // 빠른 할일 추가
    quickAddTask(e) {
        const rect = e.target.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const clickX = e.clientX - rect.left;
        
        let startHour = 0;
        let startDate = new Date(this.currentDate);
        
        if (e.target.classList.contains('time-slot')) {
            const timeLabel = e.target.querySelector('.time-label');
            if (timeLabel) {
                startHour = parseInt(timeLabel.textContent.split(':')[0]);
            }
        } else if (e.target.classList.contains('week-day-slot')) {
            // 주간 뷰에서의 위치 계산
            const weekGrid = this.weekView.querySelector('.week-grid');
            const gridRect = weekGrid.getBoundingClientRect();
            const dayIndex = Math.floor((e.clientX - gridRect.left) / (gridRect.width / 7));
            const hourIndex = Math.floor((e.clientY - gridRect.top) / (gridRect.height / 24));
            
            startHour = hourIndex;
            const weekStart = new Date(this.currentDate);
            weekStart.setDate(this.currentDate.getDate() - this.currentDate.getDay());
            startDate = new Date(weekStart);
            startDate.setDate(weekStart.getDate() + dayIndex);
        }
        
        startDate.setHours(startHour, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setHours(startHour + 1, 0, 0, 0);
        
        // 기본 할일 데이터 생성
        const taskData = {
            id: Date.now(),
            title: '새 할일',
            description: '',
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            category: 'work',
            priority: 'medium',
            repeat: 'none',
            reminder: 'none',
            tags: [],
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            color: this.getCategoryColor('work')
        };
        
        this.tasks.push(taskData);
        this.saveTasks();
        this.render();
        this.updateStats();
        
        // 편집 모달 열기
        this.openTaskModal(taskData);
    }

    // 드래그 앤 드롭 이벤트 바인딩
    bindDragAndDropEvents() {
        // 타임라인 뷰 드래그 앤 드롭
        this.timelineView.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.handleDragOver(e);
        });

        this.timelineView.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleDrop(e);
        });

        // 캘린더 뷰 드래그 앤 드롭
        this.calendarView.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.handleCalendarDragOver(e);
        });

        this.calendarView.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleCalendarDrop(e);
        });

        // 리사이즈 이벤트
        document.addEventListener('mousemove', (e) => {
            if (this.isResizing) {
                this.handleResize(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isResizing) {
                this.isResizing = false;
                this.resizeHandle = null;
            }
        });
    }

    // 드래그 오버 처리 (타임라인)
    handleDragOver(e) {
        const timeSlot = e.target.closest('.time-slot');
        if (timeSlot) {
            timeSlot.classList.add('drag-over');
        }
    }

    // 드롭 처리 (타임라인)
    handleDrop(e) {
        const timeSlot = e.target.closest('.time-slot');
        if (timeSlot && this.draggedTask) {
            const timeLabel = timeSlot.querySelector('.time-label');
            const hour = parseInt(timeLabel.textContent.split(':')[0]);
            
            // 드래그된 할일의 시간 업데이트
            const newStartTime = new Date(this.draggedTask.startTime);
            const newEndTime = new Date(this.draggedTask.endTime);
            const duration = newEndTime.getTime() - newStartTime.getTime();
            
            newStartTime.setHours(hour, 0, 0, 0);
            newEndTime.setTime(newStartTime.getTime() + duration);
            
            this.updateTaskTime(this.draggedTask.id, newStartTime, newEndTime);
        }
        
        // 드래그 오버 스타일 제거
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('drag-over');
        });
        
        this.draggedTask = null;
        this.isDragging = false;
    }

    // 캘린더 드래그 오버 처리
    handleCalendarDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        const calendarDay = e.target.closest('.calendar-day');
        if (calendarDay && this.draggedTask) {
            // 기존 하이라이트 제거
            document.querySelectorAll('.calendar-day.drag-over').forEach(day => {
                day.classList.remove('drag-over');
            });
            calendarDay.classList.add('drag-over');
            
            // 드래그 가능한 날짜인지 확인 (과거 날짜 제외)
            const dayNumber = calendarDay.querySelector('.day-number');
            if (dayNumber) {
                const day = parseInt(dayNumber.textContent);
                const year = this.currentDate.getFullYear();
                const month = this.currentDate.getMonth();
                const targetDate = new Date(year, month, day);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (targetDate < today) {
                    calendarDay.classList.add('drag-disabled');
                } else {
                    calendarDay.classList.remove('drag-disabled');
                }
            }
        }
    }

    // 캘린더 뷰 드롭 처리
    handleCalendarDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const calendarDay = e.target.closest('.calendar-day');
        if (calendarDay && this.draggedTask) {
            const dayNumber = calendarDay.querySelector('.day-number');
            if (dayNumber) {
                const day = parseInt(dayNumber.textContent);
                const year = this.currentDate.getFullYear();
                const month = this.currentDate.getMonth();
                const targetDate = new Date(year, month, day);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // 과거 날짜로 드롭 방지
                if (targetDate < today) {
                    // 에러 피드백
                    calendarDay.style.backgroundColor = '#dc3545';
                    calendarDay.style.transition = 'background-color 0.3s';
                    setTimeout(() => {
                        calendarDay.style.backgroundColor = '';
                        calendarDay.style.transition = '';
                    }, 300);
                    
                    // 알림 메시지
                    this.showNotification('과거 날짜로는 할일을 이동할 수 없습니다.', 'error');
                } else {
                    const currentStartTime = new Date(this.draggedTask.startTime);
                    const currentEndTime = new Date(this.draggedTask.endTime);
                    const duration = currentEndTime.getTime() - currentStartTime.getTime();
                    
                    const newDate = new Date(year, month, day, currentStartTime.getHours(), currentStartTime.getMinutes());
                    const newEndDate = new Date(newDate.getTime() + duration);
                    
                    this.updateTaskTime(this.draggedTask.id, newDate, newEndDate);
                    
                    // 성공 피드백
                    calendarDay.style.backgroundColor = '#28a745';
                    calendarDay.style.transition = 'background-color 0.3s';
                    setTimeout(() => {
                        calendarDay.style.backgroundColor = '';
                        calendarDay.style.transition = '';
                    }, 300);
                    
                    // 성공 알림
                    this.showNotification(`할일이 ${month + 1}월 ${day}일로 이동되었습니다.`, 'success');
                }
            }
        }
        
        // 드래그 상태 정리
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('drag-over', 'drag-disabled');
        });
        
        this.draggedTask = null;
    }

    // 리사이즈 처리
    handleResize(e) {
        if (!this.resizeHandle || !this.draggedTask) return;
        
        const rect = this.resizeHandle.getBoundingClientRect();
        const deltaY = e.clientY - rect.bottom;
        const deltaMinutes = Math.round(deltaY / 2); // 2px = 1분
        
        const task = this.tasks.find(t => t.id === this.draggedTask.id);
        if (task) {
            const newEndTime = new Date(task.endTime);
            newEndTime.setMinutes(newEndTime.getMinutes() + deltaMinutes);
            
            if (newEndTime > new Date(task.startTime)) {
                task.endTime = newEndTime.toISOString();
                this.saveTasks();
                this.render();
            }
        }
    }

    // 할일 시간 업데이트
    updateTaskTime(taskId, newStartTime, newEndTime) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.startTime = newStartTime.toISOString();
            task.endTime = newEndTime.toISOString();
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    // 할일 복사
    copyTask() {
        if (this.editingTask) {
            localStorage.setItem('copiedTask', JSON.stringify(this.editingTask));
        }
    }

    // 할일 붙여넣기
    pasteTask() {
        const copiedTask = localStorage.getItem('copiedTask');
        if (copiedTask) {
            const task = JSON.parse(copiedTask);
            task.id = Date.now();
            task.startTime = new Date().toISOString();
            task.endTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1시간 후
            task.createdAt = new Date().toISOString();
            task.updatedAt = new Date().toISOString();
            
            this.tasks.push(task);
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    // 일정 충돌 감지
    detectConflicts(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return [];
        
        const conflicts = this.tasks.filter(t => 
            t.id !== taskId && 
            !t.completed &&
            new Date(t.startTime) < new Date(task.endTime) &&
            new Date(t.endTime) > new Date(task.startTime)
        );
        
        return conflicts;
    }

    // 날짜 네비게이션
    navigateDate(days) {
        this.currentDate.setDate(this.currentDate.getDate() + days);
        this.updateDateDisplay();
        this.render();
    }

    // 오늘로 이동
    goToToday() {
        this.currentDate = new Date();
        this.updateDateDisplay();
        this.render();
    }

    // 주간 네비게이션
    navigateWeek(weeks) {
        this.currentDate.setDate(this.currentDate.getDate() + (weeks * 7));
        this.updateDateDisplay();
        this.render();
    }

    // 월간 네비게이션
    navigateMonth(months) {
        this.currentDate.setMonth(this.currentDate.getMonth() + months);
        this.updateDateDisplay();
        this.render();
    }

    // 날짜 표시 업데이트
    updateDateDisplay() {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dayOptions = { weekday: 'long' };
        
        this.currentDateEl.textContent = this.currentDate.toLocaleDateString('ko-KR', options);
        this.currentDayEl.textContent = this.currentDate.toLocaleDateString('ko-KR', dayOptions);
    }

    // 할일 모달 열기
    openTaskModal(task = null) {
        this.editingTask = task;
        
        if (task) {
            this.taskTitle.value = task.title;
            this.taskDescription.value = task.description || '';
            this.taskStartTime.value = this.formatDateTimeLocal(task.startTime);
            this.taskEndTime.value = this.formatDateTimeLocal(task.endTime);
            this.taskCategory.value = task.category || 'work';
            this.taskRepeat.value = task.repeat || 'none';
            this.taskReminder.value = task.reminder || 'none';
            this.taskTags.value = task.tags ? task.tags.join(', ') : '';
            this.setPriority(task.priority);
            
            // 메모 로드 및 렌더링
            this.renderNotes();
            
            // 편집 모드일 때만 삭제 및 이메일 버튼 표시
            this.deleteTaskBtn.style.display = 'inline-block';
            this.emailTaskBtn.style.display = 'inline-block';
        } else {
            // 새 할일 생성 시 기본값 설정
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            this.taskTitle.value = '';
            this.taskDescription.value = '';
            this.taskStartTime.value = this.formatDateTimeLocal(now);
            this.taskEndTime.value = this.formatDateTimeLocal(tomorrow);
            this.taskCategory.value = 'work';
            this.taskRepeat.value = 'none';
            this.taskReminder.value = 'none';
            this.taskTags.value = '';
            this.setPriority('medium');
            
            // 새 할일 생성 시에는 삭제 및 이메일 버튼 숨김
            this.deleteTaskBtn.style.display = 'none';
            this.emailTaskBtn.style.display = 'none';
        }
        
        this.taskModal.classList.add('show');
        this.taskTitle.focus();
    }

    // 할일 모달 닫기
    closeTaskModal() {
        this.taskModal.classList.remove('show');
        this.editingTask = null;
    }

    // 우선순위 설정
    setPriority(priority) {
        this.priorityBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.priority === priority);
        });
    }

    // 할일 저장
    saveTask() {
        const title = this.taskTitle.value.trim();
        const description = this.taskDescription.value.trim();
        const startTime = this.taskStartTime.value;
        const endTime = this.taskEndTime.value;
        const category = this.taskCategory.value;
        const repeat = this.taskRepeat.value;
        const reminder = this.taskReminder.value;
        const tags = this.taskTags.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const priority = document.querySelector('.priority-btn.active').dataset.priority;

        if (!title || !startTime || !endTime) {
            alert('제목, 시작 시간, 종료 시간을 모두 입력해주세요.');
            return;
        }

        const taskData = {
            id: this.editingTask ? this.editingTask.id : Date.now(),
            title,
            description,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            category,
            priority,
            repeat,
            reminder,
            tags,
            completed: this.editingTask ? this.editingTask.completed : false,
            createdAt: this.editingTask ? this.editingTask.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            color: this.getCategoryColor(category),
            notes: this.editingTask ? this.editingTask.notes : []
        };

        // 일정 충돌 감지
        const conflicts = this.detectConflicts(taskData.id);
        if (conflicts.length > 0 && !this.editingTask) {
            const conflictNames = conflicts.map(c => c.title).join(', ');
            if (!confirm(`다음 일정과 시간이 겹칩니다: ${conflictNames}\n계속하시겠습니까?`)) {
                return;
            }
        }

        if (this.editingTask) {
            const index = this.tasks.findIndex(t => t.id === this.editingTask.id);
            this.tasks[index] = taskData;
        } else {
            this.tasks.push(taskData);
        }

        this.saveTasks();
        this.render();
        this.updateStats();
        this.closeTaskModal();
    }

    // 카테고리별 색상 반환
    getCategoryColor(category) {
        const colors = {
            'work': '#667eea',
            'personal': '#28a745',
            'health': '#fd7e14',
            'study': '#6f42c1',
            'social': '#e83e8c',
            'other': '#6c757d'
        };
        return colors[category] || '#6c757d';
    }

    // 할일 삭제
    deleteTask(id) {
        if (confirm('정말로 이 할일을 삭제하시겠습니까?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    // 할일 완료/미완료 토글
    toggleTaskComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.render();
            this.updateStats();
        }
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
        
        // 뷰 전환
        this.timelineView.classList.toggle('hidden', view !== 'timeline');
        this.listView.classList.toggle('hidden', view !== 'list');
        this.calendarView.classList.toggle('hidden', view !== 'calendar');
        this.weekView.classList.toggle('hidden', view !== 'week');
        this.monthView.classList.toggle('hidden', view !== 'month');
        
        this.render();
    }

    // 필터링된 할일 가져오기
    getFilteredTasks() {
        let filtered = this.tasks;

        // 날짜 필터
        const currentDateStr = this.currentDate.toDateString();
        filtered = filtered.filter(task => {
            const taskDate = new Date(task.startTime).toDateString();
            return taskDate === currentDateStr;
        });

        // 상태 필터
        switch (this.currentFilter) {
            case 'urgent':
                filtered = filtered.filter(task => task.priority === 'urgent');
                break;
            case 'important':
                filtered = filtered.filter(task => task.priority === 'high' || task.priority === 'urgent');
                break;
            case 'today':
                // 이미 오늘 날짜로 필터링됨
                break;
            case 'overdue':
                filtered = filtered.filter(task => {
                    const endTime = new Date(task.endTime);
                    return !task.completed && endTime < new Date();
                });
                break;
        }

        // 시간순 정렬
        filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        return filtered;
    }

    // 타임라인 뷰 렌더링
    renderTimelineView() {
        const timeSlots = this.timelineView.querySelector('.time-slots');
        timeSlots.innerHTML = '';

        // 24시간 슬롯 생성
        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            timeLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
            
            const timeContent = document.createElement('div');
            timeContent.className = 'time-content';
            
            // 해당 시간대의 할일들 추가
            const filteredTasks = this.getFilteredTasks();
            filteredTasks.forEach(task => {
                const taskStartHour = new Date(task.startTime).getHours();
                const taskEndHour = new Date(task.endTime).getHours();
                
                if (hour >= taskStartHour && hour <= taskEndHour) {
                    const taskItem = this.createTaskItem(task);
                    timeContent.appendChild(taskItem);
                }
            });
            
            timeSlot.appendChild(timeLabel);
            timeSlot.appendChild(timeContent);
            timeSlots.appendChild(timeSlot);
        }
    }

    // 리스트 뷰 렌더링
    renderListView() {
        const taskList = this.listView.querySelector('.task-list');
        taskList.innerHTML = '';

        const filteredTasks = this.getFilteredTasks();
        filteredTasks.forEach(task => {
            const listTaskItem = this.createListTaskItem(task);
            taskList.appendChild(listTaskItem);
        });
    }

    // 캘린더 뷰 렌더링
    renderCalendarView() {
        const calendarGrid = this.calendarView.querySelector('.calendar-grid');
        calendarGrid.innerHTML = '';

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // 캘린더 헤더 업데이트
        document.getElementById('currentMonth').textContent = 
            `${year}년 ${month + 1}월`;

        // 6주 x 7일 그리드 생성
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (week * 7 + day));
                
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                
                if (currentDate.getMonth() !== month) {
                    dayElement.classList.add('other-month');
                }
                
                if (currentDate.toDateString() === new Date().toDateString()) {
                    dayElement.classList.add('today');
                }
                
                const dayNumber = document.createElement('div');
                dayNumber.className = 'day-number';
                dayNumber.textContent = currentDate.getDate();
                
                const dayTasks = document.createElement('div');
                dayTasks.className = 'day-tasks';
                
                // 해당 날짜의 할일들 추가
                const dayTasksList = this.tasks.filter(task => {
                    const taskDate = new Date(task.startTime).toDateString();
                    return taskDate === currentDate.toDateString();
                });
                
                dayTasksList.slice(0, 3).forEach(task => {
                    const dayTask = document.createElement('div');
                    dayTask.className = `day-task ${task.priority}`;
                    dayTask.textContent = task.title;
                    dayTask.style.backgroundColor = task.color;
                    dayTasks.appendChild(dayTask);
                });
                
                dayElement.appendChild(dayNumber);
                dayElement.appendChild(dayTasks);
                calendarGrid.appendChild(dayElement);
            }
        }
    }

    // 주간 뷰 렌더링
    renderWeekView() {
        const weekGrid = this.weekView.querySelector('.week-grid');
        weekGrid.innerHTML = '';

        // 현재 주의 시작일 계산
        const currentDate = new Date(this.currentDate);
        const dayOfWeek = currentDate.getDay();
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - dayOfWeek);

        // 주간 헤더 업데이트
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        document.getElementById('currentWeek').textContent = 
            `${weekStart.getFullYear()}년 ${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 - ${weekEnd.getMonth() + 1}월 ${weekEnd.getDate()}일`;

        // 시간 헤더 추가
        const timeHeader = document.createElement('div');
        timeHeader.className = 'week-time-header';
        timeHeader.textContent = '시간';
        weekGrid.appendChild(timeHeader);

        // 요일 헤더 추가
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        for (let i = 0; i < 7; i++) {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'week-day-header';
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + i);
            dayHeader.textContent = `${days[i]} ${dayDate.getDate()}`;
            weekGrid.appendChild(dayHeader);
        }

        // 시간대별 슬롯 생성
        for (let hour = 0; hour < 24; hour++) {
            // 시간 라벨
            const timeSlot = document.createElement('div');
            timeSlot.className = 'week-time-slot';
            timeSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
            weekGrid.appendChild(timeSlot);

            // 각 요일별 슬롯
            for (let day = 0; day < 7; day++) {
                const daySlot = document.createElement('div');
                daySlot.className = 'week-day-slot';
                
                const currentDayDate = new Date(weekStart);
                currentDayDate.setDate(weekStart.getDate() + day);
                currentDayDate.setHours(hour, 0, 0, 0);

                // 해당 시간대의 할일들 추가
                const dayTasks = this.tasks.filter(task => {
                    const taskDate = new Date(task.startTime);
                    const taskHour = taskDate.getHours();
                    const taskDay = taskDate.getDay();
                    return taskHour === hour && taskDay === (weekStart.getDay() + day) % 7;
                });

                dayTasks.forEach(task => {
                    const taskElement = document.createElement('div');
                    taskElement.className = 'week-task';
                    taskElement.textContent = task.title;
                    taskElement.style.backgroundColor = task.color;
                    taskElement.style.top = `${(new Date(task.startTime).getMinutes() / 60) * 100}%`;
                    taskElement.style.height = `${((new Date(task.endTime) - new Date(task.startTime)) / (1000 * 60 * 60)) * 100}%`;
                    taskElement.draggable = true;
                    taskElement.dataset.taskId = task.id;
                    
                    // 드래그 이벤트
                    taskElement.addEventListener('dragstart', (e) => {
                        this.draggedTask = task;
                        this.isDragging = true;
                        e.dataTransfer.effectAllowed = 'move';
                        taskElement.classList.add('dragging');
                    });

                    taskElement.addEventListener('dragend', () => {
                        taskElement.classList.remove('dragging');
                    });
                    
                    taskElement.addEventListener('click', () => this.openTaskModal(task));
                    daySlot.appendChild(taskElement);
                });

                weekGrid.appendChild(daySlot);
            }
        }
        
        // 주간 뷰 스크롤을 끝으로 이동
        setTimeout(() => {
            const weekGrid = this.weekView.querySelector('.week-grid');
            if (weekGrid) {
                weekGrid.scrollTop = weekGrid.scrollHeight;
            }
        }, 100);
    }

    // 월간 뷰 렌더링
    renderMonthView() {
        const monthGrid = this.monthView.querySelector('.month-grid');
        monthGrid.innerHTML = '';

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // 월간 헤더 업데이트
        document.getElementById('currentMonthView').textContent = 
            `${year}년 ${month + 1}월`;

        // 6주 x 7일 그리드 생성
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (week * 7 + day));
                
                const dayElement = document.createElement('div');
                dayElement.className = 'month-day';
                
                if (currentDate.getMonth() !== month) {
                    dayElement.classList.add('other-month');
                }
                
                if (currentDate.toDateString() === new Date().toDateString()) {
                    dayElement.classList.add('today');
                }
                
                const dayNumber = document.createElement('div');
                dayNumber.className = 'month-day-number';
                dayNumber.textContent = currentDate.getDate();
                
                const dayTasks = document.createElement('div');
                dayTasks.className = 'month-day-tasks';
                
                // 해당 날짜의 할일들 추가
                const dayTasksList = this.tasks.filter(task => {
                    const taskDate = new Date(task.startTime).toDateString();
                    return taskDate === currentDate.toDateString();
                });
                
                dayTasksList.slice(0, 5).forEach(task => {
                    const monthTask = document.createElement('div');
                    monthTask.className = 'month-task';
                    monthTask.textContent = task.title;
                    monthTask.style.backgroundColor = task.color;
                    monthTask.style.color = 'white';
                    monthTask.draggable = true;
                    monthTask.dataset.taskId = task.id;
                    
                    // 드래그 이벤트
                    monthTask.addEventListener('dragstart', (e) => {
                        this.draggedTask = task;
                        this.isDragging = true;
                        e.dataTransfer.effectAllowed = 'move';
                        monthTask.classList.add('dragging');
                    });

                    monthTask.addEventListener('dragend', () => {
                        monthTask.classList.remove('dragging');
                    });
                    
                    monthTask.addEventListener('click', () => this.openTaskModal(task));
                    dayTasks.appendChild(monthTask);
                });
                
                dayElement.appendChild(dayNumber);
                dayElement.appendChild(dayTasks);
                monthGrid.appendChild(dayElement);
            }
        }
    }

    // 할일 아이템 생성 (타임라인용)
    createTaskItem(task) {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.priority} ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;
        taskItem.draggable = true;
        taskItem.style.backgroundColor = task.color;

        const startTime = new Date(task.startTime);
        const endTime = new Date(task.endTime);
        const timeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

        taskItem.innerHTML = `
            <div class="task-title">${this.escapeHtml(task.title)}</div>
            <div class="task-time">${timeStr}</div>
            <div class="task-priority ${task.priority}">${this.getPriorityText(task.priority)}</div>
            <button class="task-delete-btn" title="삭제">
                <i class="fas fa-times"></i>
            </button>
            <div class="resize-handle resize-top"></div>
            <div class="resize-handle resize-bottom"></div>
        `;

        // 드래그 이벤트
        taskItem.addEventListener('dragstart', (e) => {
            this.draggedTask = task;
            this.isDragging = true;
            e.dataTransfer.effectAllowed = 'move';
            taskItem.classList.add('dragging');
        });

        taskItem.addEventListener('dragend', () => {
            taskItem.classList.remove('dragging');
        });

        // 더블클릭으로 편집
        taskItem.addEventListener('dblclick', () => this.openTaskModal(task));

        // 리사이즈 핸들 이벤트
        const resizeTop = taskItem.querySelector('.resize-top');
        const resizeBottom = taskItem.querySelector('.resize-bottom');

        resizeTop.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.isResizing = true;
            this.resizeHandle = resizeTop;
            this.draggedTask = task;
        });

        resizeBottom.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.isResizing = true;
            this.resizeHandle = resizeBottom;
            this.draggedTask = task;
        });

        // 삭제 버튼 이벤트
        const deleteBtn = taskItem.querySelector('.task-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteTask(task.id);
        });

        return taskItem;
    }

    // 할일 아이템 생성 (리스트용)
    createListTaskItem(task) {
        const listTaskItem = document.createElement('div');
        listTaskItem.className = `list-task-item ${task.completed ? 'completed' : ''}`;
        listTaskItem.dataset.id = task.id;

        const startTime = new Date(task.startTime);
        const endTime = new Date(task.endTime);
        const timeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

        listTaskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-info">
                <div class="task-title">${this.escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span>${timeStr}</span>
                    <span>${this.getCategoryText(task.category)}</span>
                    <span class="priority-badge ${task.priority}">${this.getPriorityText(task.priority)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-action-btn" onclick="scheduler.openTaskModal(${JSON.stringify(task).replace(/"/g, '&quot;')})" title="편집">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn" onclick="scheduler.deleteTask(${task.id})" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        const checkbox = listTaskItem.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => this.toggleTaskComplete(task.id));

        return listTaskItem;
    }

    // 통계 업데이트
    updateStats() {
        const todayTasks = this.tasks.filter(task => {
            const taskDate = new Date(task.startTime).toDateString();
            return taskDate === this.currentDate.toDateString();
        });

        const urgentCount = todayTasks.filter(task => task.priority === 'urgent').length;
        const importantCount = todayTasks.filter(task => task.priority === 'high' || task.priority === 'urgent').length;
        const completedCount = todayTasks.filter(task => task.completed).length;
        const totalCount = todayTasks.length;

        this.urgentCount.textContent = urgentCount;
        this.importantCount.textContent = importantCount;
        this.completedCount.textContent = completedCount;

        // 완료율 계산
        const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
        this.completionRate.style.width = `${completionRate}%`;
        this.completionText.textContent = `${Math.round(completionRate)}%`;

        // 평균 지연시간 계산
        const overdueTasks = this.tasks.filter(task => {
            const endTime = new Date(task.endTime);
            return !task.completed && endTime < new Date();
        });

        if (overdueTasks.length > 0) {
            const totalDelay = overdueTasks.reduce((sum, task) => {
                const endTime = new Date(task.endTime);
                const now = new Date();
                return sum + (now - endTime);
            }, 0);
            const avgDelayHours = Math.round(totalDelay / (1000 * 60 * 60) / overdueTasks.length);
            this.avgDelay.textContent = `${avgDelayHours}시간`;
        } else {
            this.avgDelay.textContent = '0시간';
        }

        // 생산성 시간대 분석
        const completedTasks = this.tasks.filter(task => task.completed);
        const hourCounts = {};
        completedTasks.forEach(task => {
            const hour = new Date(task.completedAt || task.startTime).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        if (Object.keys(hourCounts).length > 0) {
            const peakHour = Object.entries(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b, 0);
            const peakTimeStr = `${peakHour}:00-${peakHour + 1}:00`;
            this.peakTime.textContent = peakTimeStr;
        }
        
        // 완료된 할일 섹션 업데이트
        this.updateCompletedTasksPanel();
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
        // 완료율 차트
        this.renderCompletionChart();
        
        // 우선순위별 완료율
        this.updatePriorityStats();
        
        // 자기개발 진행도
        this.updateDevelopmentProgress();
        
        // 습관 분석
        this.updateHabitAnalysis();
        
        // 목표 달성 현황
        this.updateGoalStatus();
        
        // 스마트 추천 업데이트
        this.updateRecommendations();
    }

    // 완료율 차트 렌더링
    renderCompletionChart() {
        const ctx = document.getElementById('completionChart');
        if (!ctx) return;

        // 기존 차트 제거
        if (this.completionChart) {
            this.completionChart.destroy();
        }

        // 주간 데이터 수집
        const weekData = [];
        const labels = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            const dayTasks = this.tasks.filter(task => {
                const taskDate = new Date(task.startTime).toDateString();
                return taskDate === dateStr;
            });
            
            const completedTasks = dayTasks.filter(task => task.completed);
            const completionRate = dayTasks.length > 0 ? (completedTasks.length / dayTasks.length) * 100 : 0;
            
            weekData.push(completionRate);
            labels.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
        }

        this.completionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '완료율',
                    data: weekData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        // 주간 완료율 텍스트 업데이트
        const weeklyAvg = weekData.reduce((sum, rate) => sum + rate, 0) / weekData.length;
        document.getElementById('weeklyCompletion').textContent = `${Math.round(weeklyAvg)}%`;
        
        const trend = weekData[weekData.length - 1] - weekData[0];
        const trendText = trend > 0 ? `+${Math.round(trend)}%` : `${Math.round(trend)}%`;
        document.getElementById('completionTrend').textContent = trendText;
    }

    // 우선순위별 통계 업데이트
    updatePriorityStats() {
        const priorities = ['urgent', 'high', 'medium', 'low'];
        
        priorities.forEach(priority => {
            const priorityTasks = this.tasks.filter(task => task.priority === priority);
            const completedTasks = priorityTasks.filter(task => task.completed);
            const completionRate = priorityTasks.length > 0 ? (completedTasks.length / priorityTasks.length) * 100 : 0;
            
            const element = document.getElementById(`${priority}Completion`);
            if (element) {
                element.textContent = `${Math.round(completionRate)}%`;
            }
        });
    }

    // 추천사항 업데이트
    updateRecommendations() {
        const recommendations = [];
        
        // 지연된 할일 체크
        const overdueTasks = this.tasks.filter(task => {
            const endTime = new Date(task.endTime);
            return !task.completed && endTime < new Date();
        });
        
        if (overdueTasks.length > 0) {
            recommendations.push(`지연된 할일이 ${overdueTasks.length}개 있습니다. 우선순위를 재검토하세요.`);
        }
        
        // 긴급 할일 체크
        const urgentTasks = this.tasks.filter(task => task.priority === 'urgent' && !task.completed);
        if (urgentTasks.length > 3) {
            recommendations.push('긴급한 할일이 너무 많습니다. 일부를 다른 날로 분산하세요.');
        }
        
        // 생산성 시간대 추천
        const completedTasks = this.tasks.filter(task => task.completed);
        if (completedTasks.length > 0) {
            const hourCounts = {};
            completedTasks.forEach(task => {
                const hour = new Date(task.completedAt || task.startTime).getHours();
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            });
            
            const peakHour = Object.entries(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b, 0);
            if (peakHour >= 9 && peakHour <= 11) {
                recommendations.push('오전 시간대가 가장 생산적입니다. 중요한 할일을 이 시간에 배치하세요.');
            }
        }
        
        // 기본 추천사항
        if (recommendations.length === 0) {
            recommendations.push('긴급한 할일을 오전 시간대에 배치하세요.');
            recommendations.push('복잡한 작업은 90분 단위로 나누어 진행하세요.');
            recommendations.push('정기적으로 할일 목록을 검토하고 우선순위를 조정하세요.');
        }
        
        const recommendationsList = document.getElementById('recommendations');
        recommendationsList.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
    }

    // 유틸리티 함수들
    formatDateTimeLocal(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    getPriorityText(priority) {
        const texts = {
            'urgent': '긴급',
            'high': '높음',
            'medium': '보통',
            'low': '낮음'
        };
        return texts[priority] || '보통';
    }

    getCategoryText(category) {
        const texts = {
            'work': '업무',
            'personal': '개인',
            'health': '건강',
            'study': '학습',
            'social': '사회활동',
            'other': '기타'
        };
        return texts[category] || '기타';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // LocalStorage에 저장
    saveTasks() {
        localStorage.setItem('smartTasks', JSON.stringify(this.tasks));
    }

    // 렌더링
    render() {
        this.updateDateDisplay();
        
        const filteredTasks = this.getFilteredTasks();
        this.taskCount.textContent = `${filteredTasks.length}개의 할일`;
        
        // 뷰별 렌더링
        switch (this.currentView) {
            case 'timeline':
                this.renderTimelineView();
                break;
            case 'list':
                this.renderListView();
                break;
            case 'calendar':
                this.renderCalendarView();
                break;
            case 'week':
                this.renderWeekView();
                break;
            case 'month':
                this.renderMonthView();
                break;
        }
        
        // 빈 상태 표시
        if (filteredTasks.length === 0) {
            this.emptyState.classList.add('show');
        } else {
            this.emptyState.classList.remove('show');
        }
    }

    // 자기개발 진행도 업데이트
    updateDevelopmentProgress() {
        const categories = ['study', 'health', 'work'];
        const categoryNames = { study: '학습', health: '건강', work: '업무' };
        
        categories.forEach(category => {
            const categoryTasks = this.tasks.filter(task => task.category === category);
            const completedTasks = categoryTasks.filter(task => task.completed);
            const progressRate = categoryTasks.length > 0 ? (completedTasks.length / categoryTasks.length) * 100 : 0;
            
            const progressElement = document.getElementById(`${category}Progress`);
            const progressTextElement = document.getElementById(`${category}ProgressText`);
            
            if (progressElement && progressTextElement) {
                progressElement.style.width = `${progressRate}%`;
                progressTextElement.textContent = `${Math.round(progressRate)}%`;
            }
        });
    }

    // 습관 분석 업데이트
    updateHabitAnalysis() {
        // 운동 습관 분석 (건강 카테고리 + 운동 관련 키워드)
        const exerciseTasks = this.tasks.filter(task => 
            task.category === 'health' && 
            (task.title.includes('운동') || task.title.includes('스포츠') || task.title.includes('피트니스'))
        );
        const exerciseStreak = this.calculateHabitStreak(exerciseTasks);
        const exerciseSuccessRate = this.calculateHabitSuccessRate(exerciseTasks);
        
        document.getElementById('exerciseStreak').textContent = `연속 ${exerciseStreak}일`;
        document.getElementById('readingStreak').textContent = `연속 ${Math.min(exerciseStreak + 2, 12)}일`;
        document.getElementById('meditationStreak').textContent = `연속 ${Math.max(exerciseStreak - 4, 3)}일`;
    }

    // 목표 달성 현황 업데이트
    updateGoalStatus() {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // 월간 목표 (이번 달의 모든 할일)
        const monthlyTasks = this.tasks.filter(task => {
            const taskDate = new Date(task.startTime);
            return taskDate >= monthStart && taskDate <= monthEnd;
        });
        const monthlyCompleted = monthlyTasks.filter(task => task.completed).length;
        const monthlyProgress = monthlyTasks.length > 0 ? (monthlyCompleted / monthlyTasks.length) * 100 : 0;
        
        document.getElementById('monthlyGoalProgress').textContent = `${monthlyCompleted}/${monthlyTasks.length} 완료`;
        
        // 분기 목표 (3개월)
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
        
        const quarterlyTasks = this.tasks.filter(task => {
            const taskDate = new Date(task.startTime);
            return taskDate >= quarterStart && taskDate <= quarterEnd;
        });
        const quarterlyCompleted = quarterlyTasks.filter(task => task.completed).length;
        
        document.getElementById('quarterlyGoalProgress').textContent = `${quarterlyCompleted}/${quarterlyTasks.length} 완료`;
        
        // 연간 목표 (1년)
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        
        const yearlyTasks = this.tasks.filter(task => {
            const taskDate = new Date(task.startTime);
            return taskDate >= yearStart && taskDate <= yearEnd;
        });
        const yearlyCompleted = yearlyTasks.filter(task => task.completed).length;
        
        document.getElementById('yearlyGoalProgress').textContent = `${yearlyCompleted}/${yearlyTasks.length} 완료`;
    }

    // 습관 연속 일수 계산
    calculateHabitStreak(tasks) {
        if (tasks.length === 0) return 0;
        
        const completedTasks = tasks.filter(task => task.completed);
        if (completedTasks.length === 0) return 0;
        
        // 최근 완료된 할일부터 연속 일수 계산
        const sortedTasks = completedTasks.sort((a, b) => new Date(b.completedAt || b.startTime) - new Date(a.completedAt || a.startTime));
        let streak = 0;
        let currentDate = new Date();
        
        for (let i = 0; i < 30; i++) { // 최대 30일까지 확인
            const dateStr = currentDate.toDateString();
            const hasTaskOnDate = sortedTasks.some(task => {
                const taskDate = new Date(task.completedAt || task.startTime).toDateString();
                return taskDate === dateStr;
            });
            
            if (hasTaskOnDate) {
                streak++;
            } else {
                break;
            }
            
            currentDate.setDate(currentDate.getDate() - 1);
        }
        
        return streak;
    }

    // 습관 성공률 계산
    calculateHabitSuccessRate(tasks) {
        if (tasks.length === 0) return 0;
        
        const completedTasks = tasks.filter(task => task.completed);
        return Math.round((completedTasks.length / tasks.length) * 100);
    }

    // 현재 할일 삭제
    deleteCurrentTask() {
        if (!this.editingTask) return;
        
        if (confirm('정말로 이 할일을 삭제하시겠습니까?')) {
            this.deleteTask(this.editingTask.id);
            this.closeTaskModal();
        }
    }

    // 현재 할일 이메일로 보내기
    emailCurrentTask() {
        if (!this.editingTask) return;
        
        const task = this.editingTask;
        const subject = encodeURIComponent(`할일: ${task.title}`);
        const body = encodeURIComponent(`
할일 정보:

제목: ${task.title}
설명: ${task.description || '설명 없음'}
시작 시간: ${new Date(task.startTime).toLocaleString()}
종료 시간: ${new Date(task.endTime).toLocaleString()}
카테고리: ${this.getCategoryText(task.category)}
우선순위: ${this.getPriorityText(task.priority)}
반복: ${this.getRepeatText(task.repeat)}
태그: ${task.tags ? task.tags.join(', ') : '없음'}

---
스마트 스케줄러에서 전송됨
        `);
        
        const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
        window.open(mailtoLink);
    }

    // 카테고리 텍스트 가져오기
    getCategoryText(category) {
        const categories = {
            'work': '업무',
            'personal': '개인',
            'health': '건강',
            'study': '학습',
            'social': '사회활동',
            'other': '기타'
        };
        return categories[category] || category;
    }

    // 반복 텍스트 가져오기
    getRepeatText(repeat) {
        const repeats = {
            'none': '반복 안함',
            'daily': '매일',
            'weekly': '매주',
            'monthly': '매월',
            'yearly': '매년'
        };
        return repeats[repeat] || repeat;
    }

    // 완료된 할일 섹션 업데이트
    updateCompletedTasksPanel() {
        const completedTasksList = document.getElementById('completedTasksList');
        if (!completedTasksList) return;
        
        const completedTasks = this.tasks.filter(task => task.completed);
        
        if (completedTasks.length === 0) {
            completedTasksList.innerHTML = '<div class="no-completed-tasks">완료된 할일이 없습니다</div>';
            return;
        }
        
        // 최근 완료된 할일부터 정렬
        const sortedTasks = completedTasks.sort((a, b) => {
            const aTime = new Date(a.completedAt || a.updatedAt);
            const bTime = new Date(b.completedAt || b.updatedAt);
            return bTime - aTime;
        });
        
        completedTasksList.innerHTML = sortedTasks.slice(0, 10).map(task => {
            const completedTime = new Date(task.completedAt || task.updatedAt);
            const timeStr = completedTime.toLocaleDateString() + ' ' + completedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            return `
                <div class="completed-task-item">
                    <div class="completed-task-title">${this.escapeHtml(task.title)}</div>
                    <div class="completed-task-time">${timeStr}</div>
                    <div class="completed-task-category" style="background-color: ${task.color}">${this.getCategoryText(task.category)}</div>
                </div>
            `;
        }).join('');
    }

    // 메모 추가
    addNote() {
        const noteText = this.meetingNotes.value.trim();
        if (!noteText) {
            alert('메모 내용을 입력해주세요.');
            return;
        }
        
        if (!this.editingTask) {
            alert('먼저 할일을 저장해주세요.');
            return;
        }
        
        // 할일에 메모 배열이 없으면 생성
        if (!this.editingTask.notes) {
            this.editingTask.notes = [];
        }
        
        const note = {
            id: Date.now(),
            text: noteText,
            createdAt: new Date().toISOString(),
            type: 'text'
        };
        
        this.editingTask.notes.push(note);
        this.meetingNotes.value = '';
        this.renderNotes();
    }

    // 파일 첨부
    attachFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileAttachment(file);
            }
        };
        input.click();
    }

    // 파일 첨부 처리
    handleFileAttachment(file) {
        if (!this.editingTask) {
            alert('먼저 할일을 저장해주세요.');
            return;
        }
        
        // 할일에 메모 배열이 없으면 생성
        if (!this.editingTask.notes) {
            this.editingTask.notes = [];
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const note = {
                id: Date.now(),
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                fileData: e.target.result,
                createdAt: new Date().toISOString(),
                type: 'file'
            };
            
            this.editingTask.notes.push(note);
            this.renderNotes();
        };
        reader.readAsDataURL(file);
    }

    // 메모 렌더링
    renderNotes() {
        if (!this.notesList || !this.editingTask) return;
        
        const notes = this.editingTask.notes || [];
        
        if (notes.length === 0) {
            this.notesList.innerHTML = '<div class="no-notes">첨부된 메모가 없습니다</div>';
            return;
        }
        
        this.notesList.innerHTML = notes.map(note => {
            if (note.type === 'file') {
                return `
                    <div class="note-item file-note">
                        <div class="note-header">
                            <i class="fas fa-file"></i>
                            <span class="note-title">${this.escapeHtml(note.fileName)}</span>
                            <button class="note-delete-btn" onclick="scheduler.deleteNote(${note.id})">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="note-meta">
                            <span>${this.formatFileSize(note.fileSize)}</span>
                            <span>${new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="note-item text-note">
                        <div class="note-header">
                            <i class="fas fa-sticky-note"></i>
                            <span class="note-title">메모</span>
                            <button class="note-delete-btn" onclick="scheduler.deleteNote(${note.id})">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="note-text">${this.escapeHtml(note.text)}</div>
                        <div class="note-meta">
                            <span>${new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }

    // 메모 삭제
    deleteNote(noteId) {
        if (!this.editingTask || !this.editingTask.notes) return;
        
        const noteIndex = this.editingTask.notes.findIndex(note => note.id === noteId);
        if (noteIndex !== -1) {
            this.editingTask.notes.splice(noteIndex, 1);
            this.renderNotes();
        }
    }

    // 파일 크기 포맷팅
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 주간 뷰 드래그 오버 처리
    handleWeekDragOver(e) {
        const daySlot = e.target.closest('.week-day-slot');
        if (daySlot) {
            daySlot.classList.add('drag-over');
        }
    }

    // 주간 뷰 드롭 처리
    handleWeekDrop(e) {
        const daySlot = e.target.closest('.week-day-slot');
        if (daySlot && this.draggedTask) {
            const weekGrid = this.weekView.querySelector('.week-grid');
            const gridRect = weekGrid.getBoundingClientRect();
            const dayIndex = Math.floor((e.clientX - gridRect.left) / (gridRect.width / 7));
            const hourIndex = Math.floor((e.clientY - gridRect.top) / (gridRect.height / 24));
            
            // 현재 주의 시작일 계산
            const currentDate = new Date(this.currentDate);
            const dayOfWeek = currentDate.getDay();
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - dayOfWeek);
            
            // 새로운 날짜 계산
            const newDate = new Date(weekStart);
            newDate.setDate(weekStart.getDate() + dayIndex);
            newDate.setHours(hourIndex, 0, 0, 0);
            
            const currentStartTime = new Date(this.draggedTask.startTime);
            const currentEndTime = new Date(this.draggedTask.endTime);
            const duration = currentEndTime.getTime() - currentStartTime.getTime();
            
            const newEndDate = new Date(newDate.getTime() + duration);
            
            this.updateTaskTime(this.draggedTask.id, newDate, newEndDate);
        }
        
        // 드래그 오버 스타일 제거
        document.querySelectorAll('.week-day-slot').forEach(slot => {
            slot.classList.remove('drag-over');
        });
        
        this.draggedTask = null;
        this.isDragging = false;
    }

    // 월간 뷰 드래그 오버 처리
    handleMonthDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        const monthDay = e.target.closest('.month-day');
        if (monthDay && this.draggedTask) {
            // 기존 하이라이트 제거
            document.querySelectorAll('.month-day.drag-over').forEach(day => {
                day.classList.remove('drag-over');
            });
            monthDay.classList.add('drag-over');
            
            // 드래그 가능한 날짜인지 확인 (과거 날짜 제외)
            const dayNumber = monthDay.querySelector('.month-day-number');
            if (dayNumber) {
                const day = parseInt(dayNumber.textContent);
                const year = this.currentDate.getFullYear();
                const month = this.currentDate.getMonth();
                const targetDate = new Date(year, month, day);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (targetDate < today) {
                    monthDay.classList.add('drag-disabled');
                } else {
                    monthDay.classList.remove('drag-disabled');
                }
            }
        }
    }

    // 월간 뷰 드롭 처리
    handleMonthDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const monthDay = e.target.closest('.month-day');
        if (monthDay && this.draggedTask) {
            const dayNumber = monthDay.querySelector('.month-day-number');
            if (dayNumber) {
                const day = parseInt(dayNumber.textContent);
                const year = this.currentDate.getFullYear();
                const month = this.currentDate.getMonth();
                const targetDate = new Date(year, month, day);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // 과거 날짜로 드롭 방지
                if (targetDate < today) {
                    // 에러 피드백
                    monthDay.style.backgroundColor = '#dc3545';
                    monthDay.style.transition = 'background-color 0.3s';
                    setTimeout(() => {
                        monthDay.style.backgroundColor = '';
                        monthDay.style.transition = '';
                    }, 300);
                    
                    // 알림 메시지
                    this.showNotification('과거 날짜로는 할일을 이동할 수 없습니다.', 'error');
                } else {
                    const newDate = new Date(year, month, day);
                    const currentStartTime = new Date(this.draggedTask.startTime);
                    const currentEndTime = new Date(this.draggedTask.endTime);
                    const duration = currentEndTime.getTime() - currentStartTime.getTime();
                    
                    newDate.setHours(currentStartTime.getHours(), currentStartTime.getMinutes(), 0, 0);
                    const newEndDate = new Date(newDate.getTime() + duration);
                    
                    this.updateTaskTime(this.draggedTask.id, newDate, newEndDate);
                    
                    // 성공 피드백
                    monthDay.style.backgroundColor = '#28a745';
                    monthDay.style.transition = 'background-color 0.3s';
                    setTimeout(() => {
                        monthDay.style.backgroundColor = '';
                        monthDay.style.transition = '';
                    }, 300);
                    
                    // 성공 알림
                    this.showNotification(`할일이 ${month + 1}월 ${day}일로 이동되었습니다.`, 'success');
                }
            }
        }
        
        // 드래그 상태 정리
        document.querySelectorAll('.month-day').forEach(day => {
            day.classList.remove('drag-over', 'drag-disabled');
        });
        
        this.draggedTask = null;
        this.isDragging = false;
    }
}

// 앱 초기화
let scheduler;
document.addEventListener('DOMContentLoaded', () => {
    scheduler = new SmartScheduler();
});
