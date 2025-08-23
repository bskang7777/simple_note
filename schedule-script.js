// 스마트 스케줄러 클래스
class SmartScheduler {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('smartTasks')) || [];
        this.currentDate = new Date();
        this.currentView = 'timeline';
        this.currentFilter = 'all';
        this.editingTask = null;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
        this.updateStats();
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

        // 모달 이벤트
        this.saveTaskBtn.addEventListener('click', () => this.saveTask());
        this.closeModalBtn.addEventListener('click', () => this.closeTaskModal());
        this.closeInsightsBtn.addEventListener('click', () => this.closeInsightsModal());

        // 우선순위 버튼
        this.priorityBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setPriority(e.target.dataset.priority);
            });
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
                }
            }
            if (e.key === 'Escape') {
                this.closeTaskModal();
                this.closeInsightsModal();
            }
        });
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
        } else {
            this.taskTitle.value = '';
            this.taskDescription.value = '';
            this.taskStartTime.value = '';
            this.taskEndTime.value = '';
            this.taskCategory.value = 'work';
            this.taskRepeat.value = 'none';
            this.taskReminder.value = 'none';
            this.taskTags.value = '';
            this.setPriority('medium');
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
            updatedAt: new Date().toISOString()
        };

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
                    dayTasks.appendChild(dayTask);
                });
                
                dayElement.appendChild(dayNumber);
                dayElement.appendChild(dayTasks);
                calendarGrid.appendChild(dayElement);
            }
        }
    }

    // 할일 아이템 생성 (타임라인용)
    createTaskItem(task) {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.priority} ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;

        const startTime = new Date(task.startTime);
        const endTime = new Date(task.endTime);
        const timeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

        taskItem.innerHTML = `
            <div class="task-title">${this.escapeHtml(task.title)}</div>
            <div class="task-time">${timeStr}</div>
            <div class="task-priority ${task.priority}">${this.getPriorityText(task.priority)}</div>
        `;

        taskItem.addEventListener('click', () => this.openTaskModal(task));

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
        }
        
        // 빈 상태 표시
        if (filteredTasks.length === 0) {
            this.emptyState.classList.add('show');
        } else {
            this.emptyState.classList.remove('show');
        }
    }
}

// 앱 초기화
let scheduler;
document.addEventListener('DOMContentLoaded', () => {
    scheduler = new SmartScheduler();
});
