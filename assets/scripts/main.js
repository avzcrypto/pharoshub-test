/**
 * Pharos Hub - Main JavaScript
 * Author: @avzcrypto
 * Version: 2.0 - Production Ready
 */

// === CONFIGURATION ===
const TASK_LIMITS = {
    // Season 1 Tasks 
    'swap_count': 91,           // Zenith Swaps
    'lp_count': 91,             // Zenith LP  
    'faroswap_swaps': 91,
    'faroswap_lp': 91,
    'mint_domain': 91,

    // Season 2 Tasks 
    'primuslabs_send': 91,
    'autostaking': 91,          // Stake
    'lend_borrow': 91,
    'bitverse': 91,
    'brokex': 91,               // CFD Trading
    'aquaflux': 1,

    // Atlantic Tasks
    'invite_friends': 91,
    'atlantic_onchain': 91,     // Via Atlantic On-chain Address
    'topnod': 91,               // Via TopNod
    'asseto': 91,               // Asseto
    'grandline': 91             // Grandline
};

// === MEMBER SINCE UTILITIES ===
const MemberSinceUtils = {
    formatMemberSince(memberSinceString) {
        if (!memberSinceString) {
            return {
                days: 0,
                formattedDate: 'Unknown'
            };
        }

        try {
            let memberDate;
            
            if (memberSinceString.includes('T')) {
                memberDate = new Date(memberSinceString);
            } else {
                memberDate = new Date(memberSinceString);
            }

            if (isNaN(memberDate.getTime())) {
                return {
                    days: 0,
                    formattedDate: 'Unknown'
                };
            }

            const now = new Date();
            const diffTime = Math.abs(now - memberDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            const options = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            };
            const formattedDate = memberDate.toLocaleDateString('en-US', options);

            return {
                days: diffDays,
                formattedDate: formattedDate
            };
        } catch (error) {
            return {
                days: 0,
                formattedDate: 'Unknown'
            };
        }
    }
};

// === DOM ELEMENTS ===
const DOMElements = {
    // Input elements
    walletInput: document.getElementById('walletAddress'),
    checkButton: document.getElementById('checkButton'),
    
    // State elements
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    results: document.getElementById('results'),

    // Member since elements
    testnetDays: document.getElementById('testnetDays'),
    memberSinceDate: document.getElementById('memberSinceDate'),
    
    // Stats elements
    totalPoints: document.getElementById('totalPoints'),
    currentLevel: document.getElementById('currentLevel'),
    levelProgress: document.getElementById('levelProgress'),
    currentRank: document.getElementById('currentRank'),
    totalUsers: document.getElementById('totalUsers'),
    
    // Season 1 task elements
    zenithSwaps: document.getElementById('zenithSwaps'),
    zenithLP: document.getElementById('zenithLP'),
    faroswapSwaps: document.getElementById('faroswapSwaps'),
    faroswapLP: document.getElementById('faroswapLP'),
    mintDomain: document.getElementById('mintDomain'),
    
    // Season 2 task elements
    primuslabsSend: document.getElementById('primuslabsSend'),
    rwafi: document.getElementById('rwafi'),
    stake: document.getElementById('stake'),
    cfdTrading: document.getElementById('cfdTrading'),
    bitverse: document.getElementById('bitverse'),
    lendBorrow: document.getElementById('lendBorrow'),

    // Atlantic task elements
    inviteFriends: document.getElementById('inviteFriends'),
    atlanticOnchain: document.getElementById('atlanticOnchain'),
    topnod: document.getElementById('topnod'),
    asseto: document.getElementById('asseto'),
    grandline: document.getElementById('grandline'),
    
    // UI elements
    mainPageFooter: document.getElementById('mainPageFooter'),
    headerSection: document.querySelector('.header-section')
};

// === ANALYTICS FUNCTIONS ===
const Analytics = {
    trackPageView() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'Pharos Stats Checker',
                page_location: window.location.href
            });
        }
    },

    trackWalletSearch(address) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'wallet_search', {
                event_category: 'engagement',
                event_label: 'wallet_check',
                wallet_address: address.substring(0, 6) + '...' + address.substring(address.length - 4)
            });
        }
    },

    trackStatsLoaded(data) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'stats_loaded', {
                event_category: 'engagement',
                event_label: 'successful_check',
                total_points: data.total_points,
                user_level: data.current_level,
                user_rank: data.exact_rank,
                custom_parameters: {
                    send_count: data.send_count,
                    zenith_swaps: data.zenith_swaps || data.swap_count || 0,
                    faroswap_swaps: data.faroswap_swaps || 0
                }
            });
        }
    },

    trackAuthorClick() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'author_follow_click_neomorphic', {
                event_category: 'engagement',
                event_label: 'neomorphic_cta_button',
                link_url: 'https://x.com/avzcrypto',
                button_style: 'neomorphic_follow_me'
            });
        }
    },

    trackSeasonSwitch(season) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'season_switch', {
                event_category: 'engagement',
                event_label: 'season_switcher',
                season: season
            });
        }
    },

    trackError(errorMessage) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'error_occurred', {
                event_category: 'error',
                event_label: 'wallet_check_failed',
                error_message: errorMessage
            });
        }
    }
};

// === UTILITY FUNCTIONS ===
const Utils = {
    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    },

    formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    },

    animateValue(element, start, end, duration = 1000) {
        if (!element) return;
        
        const startTime = performance.now();
        const range = end - start;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (range * progress);
            element.textContent = Utils.formatNumber(Math.floor(current));
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    },

    animateRank(element, start, end, duration = 1000) {
        if (!element) return;
        
        const startTime = performance.now();
        const range = end - start;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (range * progress);
            element.textContent = '#' + Utils.formatNumber(Math.floor(current));
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
};

// === TASK PROGRESS FUNCTIONS ===
const TaskProgress = {
    getTaskProgress(taskKey, currentValue) {
        const maxValue = TASK_LIMITS[taskKey] || 91;
        const progress = Math.min((currentValue / maxValue) * 100, 100);
        const isMaxed = currentValue >= maxValue;
        
        return {
            current: currentValue,
            max: maxValue,
            progress: progress,
            isMaxed: isMaxed,
            progressText: isMaxed ? 'Max points achieved!' : 'Progress to max points',
            valueText: isMaxed ? 'MAXED' : `${currentValue}/${maxValue}`
        };
    },

    updateTaskWithProgress(taskKey, element, value) {
        if (!element) return;
        
        // Animate number
        Utils.animateValue(element, 0, value);
        
        // Add progress bar to parent card
        const taskCard = element.closest('.task-card');
        if (taskCard) {
            // Remove existing progress bar if exists
            const existingProgress = taskCard.querySelector('.task-progress-container');
            if (existingProgress) {
                existingProgress.remove();
            }
            
            // Get progress data
            const progress = this.getTaskProgress(taskKey, value);
            
            // Create progress bar HTML
            const progressHTML = `
                <div class="task-progress-container">
                    <div class="task-progress">
                        <div class="task-progress-bar ${progress.isMaxed ? 'progress-completed' : ''}" style="width: 0%"></div>
                    </div>
                    <div class="task-progress-info">
                        <div class="progress-label ${progress.isMaxed ? 'progress-completed-label' : ''}">${progress.progressText}</div>
                        <div class="progress-value ${progress.isMaxed ? 'max-indicator' : ''}">${progress.valueText}</div>
                    </div>
                </div>
            `;
            
            // Insert progress bar into card
            taskCard.insertAdjacentHTML('beforeend', progressHTML);
            
            // Animate progress bar with delay
            setTimeout(() => {
                const progressBar = taskCard.querySelector('.task-progress-bar');
                if (progressBar) {
                    progressBar.style.width = `${progress.progress}%`;
                }
            }, 700);
        }
    }
};

// === UI STATE MANAGEMENT ===
const UIState = {
    showError(message) {
        if (DOMElements.error) {
            DOMElements.error.textContent = message;
            DOMElements.error.classList.add('show');
        }
        if (DOMElements.loading) DOMElements.loading.classList.remove('show');
        if (DOMElements.results) DOMElements.results.classList.remove('show');
        
        // Show footer on main page when error occurs
        if (DOMElements.mainPageFooter) {
            DOMElements.mainPageFooter.style.display = 'block';
        }
        
        // Track error
        Analytics.trackError(message);
    },

    hideError() {
        if (DOMElements.error) {
            DOMElements.error.classList.remove('show');
        }
    },

    showLoading() {
        if (DOMElements.loading) DOMElements.loading.classList.add('show');
        if (DOMElements.results) DOMElements.results.classList.remove('show');
        this.hideError();
        
        if (DOMElements.checkButton) {
            DOMElements.checkButton.disabled = true;
            DOMElements.checkButton.textContent = 'Checking...';
        }
        
        // Hide header section and footer during loading
        if (DOMElements.headerSection) {
            DOMElements.headerSection.style.display = 'none';
        }
        if (DOMElements.mainPageFooter) {
            DOMElements.mainPageFooter.style.display = 'none';
        }

        const tabNavigation = document.getElementById('tabNavigation');
        if (tabNavigation) {
        tabNavigation.style.display = 'none';
    }
    },

    hideLoading() {
        if (DOMElements.loading) DOMElements.loading.classList.remove('show');
        
        if (DOMElements.checkButton) {
            DOMElements.checkButton.disabled = false;
            DOMElements.checkButton.textContent = 'Check Statistics';
        }
        
        // Show header section back
        if (DOMElements.headerSection) {
            DOMElements.headerSection.style.display = 'flex';
        }
    }
};

// === SEASON SWITCHER ===
const SeasonSwitcher = {
    switchSeason(season) {
        // Track season switch
        Analytics.trackSeasonSwitch(season);

        // Update active tab
        document.querySelectorAll('.season-tab').forEach(tab => {
            tab.classList.remove('select');
        });
        
        const activeTab = document.querySelector(`[data-season="${season}"]`);
        if (activeTab) {
            activeTab.classList.add('select');
        }

        // Show/hide content для 3 сезонов
        const season1Content = document.getElementById('season1-content');
        const season2Content = document.getElementById('season2-content');
        const atlanticContent = document.getElementById('atlantic-content');
        
        // Скрываем все сезоны
        if (season1Content) season1Content.style.display = 'none';
        if (season2Content) season2Content.style.display = 'none';
        if (atlanticContent) atlanticContent.style.display = 'none';
        
        // Показываем нужный сезон
        if (season === 'season1') {
            if (season1Content) season1Content.style.display = 'block';
        } else if (season === 'season2') {
            if (season2Content) season2Content.style.display = 'block';
        } else if (season === 'atlantic') {
            if (atlanticContent) atlanticContent.style.display = 'block';
        }
    }
};

// === LEVEL PROGRESS CALCULATOR ===
const LevelCalculator = {
    levels: {
        1: { min: 0, max: 1000 },
        2: { min: 1001, max: 3500 },
        3: { min: 3501, max: 6000 },
        4: { min: 6001, max: 10000 },
        5: { min: 10001, max: 20000 }
        6: { min: 20001, max: 35000 }
    },

    updateLevelProgress(current, total) {
        const percentage = total > 0 ? (current / total) * 100 : 0;
        if (DOMElements.levelProgress) {
            DOMElements.levelProgress.style.width = `${Math.min(percentage, 100)}%`;
        }
    }
};

// === MAIN API FUNCTIONS ===
const PharosAPI = {
    async checkWalletStats() {
        const address = DOMElements.walletInput?.value?.trim();

        if (!address) {
            UIState.showError('Please enter a wallet address');
            return;
        }

        if (!Utils.isValidAddress(address)) {
            UIState.showError('Please enter a valid Ethereum address');
            return;
        }

        // Track wallet search attempt
        Analytics.trackWalletSearch(address);

        UIState.showLoading();

        try {
            const response = await fetch('/assets/api/check-wallet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wallet_address: address
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch wallet statistics');
            }

            // Track successful stats loading
            Analytics.trackStatsLoaded(data);
            
            this.displayResults(data);

        } catch (err) {
            console.error('Wallet check error:', err);
            UIState.showError(err.message || 'Failed to fetch wallet statistics. Please try again.');
        } finally {
            UIState.hideLoading();
        }
    },

    displayResults(data) {
        UIState.hideError();

        const maxLevel = 6;

        // Animate main stats with level cap
        Utils.animateValue(DOMElements.totalPoints, 0, data.total_points);
        Utils.animateValue(DOMElements.currentLevel, 1, Math.min(data.current_level, maxLevel));
        
        // Animate rank
        if (data.exact_rank && DOMElements.currentRank) {
            Utils.animateRank(DOMElements.currentRank, 1, data.exact_rank);
            Utils.animateValue(DOMElements.totalUsers, 1, data.total_users_count || 550000);
        } else if (DOMElements.currentRank) {
            DOMElements.currentRank.textContent = 'Unranked';
            Utils.animateValue(DOMElements.totalUsers, 1, data.total_users_count || 550000);
        }
        
        // Update member since display
        if (DOMElements.testnetDays && DOMElements.memberSinceDate) {
            const memberData = MemberSinceUtils.formatMemberSince(data.member_since);
            Utils.animateValue(DOMElements.testnetDays, 0, memberData.days);
            DOMElements.memberSinceDate.textContent = `Since ${memberData.formattedDate}`;
        }

        // Update level progress bar
        if (DOMElements.levelProgress) {
            const currentLevel = Math.min(data.current_level, 6);
            const levelData = LevelCalculator.levels[currentLevel];
            
            if (levelData) {
                const progressInLevel = data.total_points - levelData.min;
                const pointsForLevel = levelData.max - levelData.min;
                const percentage = Math.min((progressInLevel / pointsForLevel) * 100, 100);
                
                setTimeout(() => {
                    DOMElements.levelProgress.style.width = `${Math.max(0, percentage)}%`;
                }, 500);
            }
        }

        // Season 1 tasks with progress bars
        TaskProgress.updateTaskWithProgress('swap_count', DOMElements.zenithSwaps, data.swap_count || 0);
        TaskProgress.updateTaskWithProgress('lp_count', DOMElements.zenithLP, data.lp_count || 0);
        TaskProgress.updateTaskWithProgress('faroswap_swaps', DOMElements.faroswapSwaps, data.faroswap_swaps || 0);
        TaskProgress.updateTaskWithProgress('faroswap_lp', DOMElements.faroswapLP, data.faroswap_lp || 0);
        TaskProgress.updateTaskWithProgress('mint_domain', DOMElements.mintDomain, data.mint_domain || 0);

        // Season 2 tasks with progress bars
        if (DOMElements.primuslabsSend) TaskProgress.updateTaskWithProgress('primuslabs_send', DOMElements.primuslabsSend, data.primuslabs_send || 0);
        if (DOMElements.stake) TaskProgress.updateTaskWithProgress('autostaking', DOMElements.stake, data.autostaking || 0);
        if (DOMElements.lendBorrow) TaskProgress.updateTaskWithProgress('lend_borrow', DOMElements.lendBorrow, data.lend_borrow || 0);
        if (DOMElements.rwafi) TaskProgress.updateTaskWithProgress('aquaflux', DOMElements.rwafi, data.aquaflux || 0);
        if (DOMElements.bitverse) TaskProgress.updateTaskWithProgress('bitverse', DOMElements.bitverse, data.bitverse || 0);
        if (DOMElements.cfdTrading) TaskProgress.updateTaskWithProgress('brokex', DOMElements.cfdTrading, data.brokex || 0);

        // Atlantic tasks with progress bars
        if (DOMElements.inviteFriends) TaskProgress.updateTaskWithProgress('invite_friends', DOMElements.inviteFriends, data.invite_friends || 0);
        if (DOMElements.atlanticOnchain) TaskProgress.updateTaskWithProgress('atlantic_onchain', DOMElements.atlanticOnchain, data.atlantic_onchain || 0);
        if (DOMElements.topnod) TaskProgress.updateTaskWithProgress('topnod', DOMElements.topnod, data.topnod || 0);
        if (DOMElements.asseto) TaskProgress.updateTaskWithProgress('asseto', DOMElements.asseto, data.asseto || 0);
        if (DOMElements.grandline) TaskProgress.updateTaskWithProgress('grandline', DOMElements.grandline, data.grandline || 0);

        // Show results with animation
        if (DOMElements.results) {
            DOMElements.results.classList.add('show');
        }

        // Show tab navigation after successful check
        const tabNavigation = document.getElementById('tabNavigation');
        if (tabNavigation) {
            tabNavigation.style.display = 'flex';
        }
        
        // Hide footer on main page when showing results
        if (DOMElements.mainPageFooter) {
            DOMElements.mainPageFooter.style.display = 'none';
        }
        
        // Trigger animations for result sections
        const animatedElements = DOMElements.results?.querySelectorAll('.animate__fadeInUp');
        if (animatedElements) {
            animatedElements.forEach((el, index) => {
                el.style.animationDelay = `${(index + 1) * 0.1}s`;
            });
        }
    }
};

// === EVENT HANDLERS ===
const EventHandlers = {
    init() {
        // Main wallet check functionality
        if (DOMElements.checkButton) {
            DOMElements.checkButton.addEventListener('click', () => PharosAPI.checkWalletStats());
        }

        if (DOMElements.walletInput) {
            DOMElements.walletInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    PharosAPI.checkWalletStats();
                }
            });

            DOMElements.walletInput.addEventListener('input', () => {
                UIState.hideError();
            });
        }

        // Season switcher event listeners
        document.querySelectorAll('.season-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const season = tab.getAttribute('data-season');
                if (season) {
                    SeasonSwitcher.switchSeason(season);
                }
            });
        });

        // Author link tracking
        const resultsAuthorLink = document.getElementById('resultsAuthorLink');
        const authorLink = document.getElementById('authorLink');
        
        if (resultsAuthorLink) {
            resultsAuthorLink.addEventListener('click', Analytics.trackAuthorClick);
        }
        if (authorLink) {
            authorLink.addEventListener('click', Analytics.trackAuthorClick);
        }
    }
};

// === INITIALIZATION ===
const PharosApp = {
    init() {
        // Initialize event handlers
        EventHandlers.init();

        // Auto-focus input if it exists
        if (DOMElements.walletInput) {
            DOMElements.walletInput.focus();
        }

        // Track page view
        Analytics.trackPageView();
        
        // Initialize Atlantic by default
        SeasonSwitcher.switchSeason('atlantic');
        
        // Show footer on main page when loading
        if (DOMElements.mainPageFooter) {
            DOMElements.mainPageFooter.style.display = 'block';
        }
    }
};

// Tab functionality
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`tab-${tabName}`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

// Dashboard functionality
async function loadDashboardData() {
    try {
        const response = await fetch('/assets/api/admin/stats');
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to load dashboard data');
        }

        updateDashboardStats(data);
        updateLevelDistribution(data.level_distribution);
        updateTopUsersTable(data.leaderboard);

    } catch (error) {
        console.error('Dashboard load error:', error);
        showDashboardError();
    }
}

function updateDashboardStats(data) {
    const totalUsersEl = document.getElementById('dashboardTotalUsers');
    const totalChecksEl = document.getElementById('dashboardTotalChecks');
    const topScoreEl = document.getElementById('dashboardTopScore');
    
    if (totalUsersEl) totalUsersEl.textContent = formatNumber(data.total_users || 0);
    if (totalChecksEl) totalChecksEl.textContent = formatNumber(data.total_checks || 0);
    if (topScoreEl) topScoreEl.textContent = formatNumber(data.leaderboard?.[0]?.total_points || 0);
}

function updateLevelDistribution(levelDistribution) {
    if (!levelDistribution || typeof levelDistribution !== 'object') {
        return;
    }
    
    const levels = ['level-1', 'level-2', 'level-3', 'level-4', 'level-5', 'level-6'];
    
    // Calculate total for percentages
    const totalUsers = Object.values(levelDistribution).reduce((sum, count) => sum + (parseInt(count) || 0), 0);
    
    if (totalUsers === 0) {
        return;
    }
    
    // Find maximum count for bar width calculation
    const maxCount = Math.max(...Object.values(levelDistribution).map(count => parseInt(count) || 0));
    
    levels.forEach((level, index) => {
        const count = parseInt(levelDistribution[level]) || 0;
        const percentage = ((count / totalUsers) * 100).toFixed(1);
        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
        
        // Find the level bar container for Dashboard
        const levelBars = document.querySelectorAll('#levelBars .level-bar');
        
        if (levelBars[index]) {
            // Update count with percentage
            const countElement = levelBars[index].querySelector('.level-count');
            if (countElement) {
                countElement.textContent = `${formatNumber(count)} (${percentage}%)`;
            }
            
            // Update progress bar
            const progressBar = levelBars[index].querySelector('.level-progress-bar');
            if (progressBar && maxCount > 0) {
                setTimeout(() => {
                    progressBar.style.width = `${barWidth}%`;
                }, index * 200);
            }
        }
    });
}

// === DASHBOARD PAGINATION STATE ===
let dashboardState = {
    currentPage: 1,
    totalPages: 10,
    usersPerPage: 10,
    allUsers: []
};

function updateTopUsersTable(leaderboard) {
    const tbody = document.getElementById('dashboardUsersTable');
    if (!leaderboard || leaderboard.length === 0) {
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #64748b;">No data available</td></tr>';
        }
        return;
    }
    
    // Save top 100 users
    dashboardState.allUsers = leaderboard.slice(0, 100);
    dashboardState.totalPages = Math.ceil(dashboardState.allUsers.length / dashboardState.usersPerPage);
    
    // Create page numbers dynamically
    updatePageNumbers();
    
    renderUsersPage();
    updatePaginationControls();
}

function renderUsersPage() {
    const { currentPage, usersPerPage, allUsers } = dashboardState;
    const tbody = document.getElementById('dashboardUsersTable');
    
    if (!tbody || !allUsers.length) return;
    
    // Calculate page bounds
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const pageUsers = allUsers.slice(startIndex, endIndex);
    
    // Generate HTML for current page users
    const rowsHtml = pageUsers.map((user, localIndex) => {
        const globalRank = startIndex + localIndex + 1;
        const rankClass = getRankClass(globalRank);
        
        return '<tr>' +
            '<td><div class="rank-badge ' + rankClass + '">' + globalRank + '</div></td>' +
            '<td><div class="user-address">' + formatAddress(user.address) + '</div></td>' +
            '<td><div class="points-level-stack">' +
                '<div class="points">' + formatFullNumber(user.total_points) + '</div>' +
                '<div class="level-badge">LVL ' + user.current_level + '</div>' +
            '</div></td>' +
            '<td><div class="member-since">' + formatDate(user.member_since) + '</div></td>' +
            '</tr>';
    }).join('');
    
    tbody.innerHTML = rowsHtml;
    updateRangeInfo();
}

// Helper function to get rank CSS class
function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-default';
}

function updatePageNumbers() {
    const pageNumbers = document.getElementById('pageNumbers');
    if (!pageNumbers) return;
    
    const { totalPages } = dashboardState;
    
    let pagesHtml = '';
    for (let i = 1; i <= totalPages; i++) {
        pagesHtml += '<button class="pagination-btn page-number" data-page="' + i + '">' + i + '</button>';
        
        // Add dots after 3rd page if more than 5 pages
        if (i === 3 && totalPages > 5) {
            pagesHtml += '<span class="page-dots">...</span>';
            i = totalPages - 1; // Jump to second-to-last page
        }
    }
    
    pageNumbers.innerHTML = pagesHtml;
}

function updateRangeInfo() {
    const { currentPage, usersPerPage, allUsers } = dashboardState;
    const startRank = (currentPage - 1) * usersPerPage + 1;
    const endRank = Math.min(currentPage * usersPerPage, allUsers.length);
    
    const rangeInfo = document.getElementById('usersRangeInfo');
    const currentPageDisplay = document.getElementById('currentPageDisplay');
    const totalPagesDisplay = document.getElementById('totalPagesDisplay');
    
    if (rangeInfo) rangeInfo.textContent = 'Showing ' + startRank + '-' + endRank + ' of ' + allUsers.length;
    if (currentPageDisplay) currentPageDisplay.textContent = currentPage;
    if (totalPagesDisplay) totalPagesDisplay.textContent = dashboardState.totalPages;
}

function updatePaginationControls() {
    const { currentPage, totalPages } = dashboardState;
    
    // Update navigation buttons
    const firstBtn = document.getElementById('firstPageBtn');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const lastBtn = document.getElementById('lastPageBtn');
    
    if (firstBtn) firstBtn.disabled = currentPage === 1;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    if (lastBtn) lastBtn.disabled = currentPage === totalPages;
    
    // Update active page highlighting
    const pageButtons = document.querySelectorAll('.page-number');
    pageButtons.forEach(btn => {
        const page = parseInt(btn.dataset.page);
        if (page === currentPage) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function goToPage(page) {
    if (page < 1 || page > dashboardState.totalPages || page === dashboardState.currentPage) return;
    
    dashboardState.currentPage = page;
    renderUsersPage();
    updatePaginationControls();
}

function formatAddress(address) {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return 'Unknown';
    }
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function formatFullNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

function showDashboardError() {
    const tbody = document.getElementById('dashboardUsersTable');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #dc2626;">Failed to load dashboard data</td></tr>';
    }
}

// Enhanced switchTab with dashboard loading
const originalSwitchTab = switchTab;
switchTab = function(tabName) {
    originalSwitchTab.call(this, tabName);
    
    if (tabName === 'dashboard') {
        loadDashboardData();
    }
};

// Event listeners for pagination
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main app
    PharosApp.init();
    
    // Pagination handlers
    document.addEventListener('click', function(e) {
        if (e.target.id === 'firstPageBtn') goToPage(1);
        if (e.target.id === 'prevPageBtn') goToPage(dashboardState.currentPage - 1);
        if (e.target.id === 'nextPageBtn') goToPage(dashboardState.currentPage + 1);
        if (e.target.id === 'lastPageBtn') goToPage(dashboardState.totalPages);
        if (e.target.classList.contains('page-number')) {
            const page = parseInt(e.target.dataset.page);
            if (!isNaN(page)) goToPage(page);
        }
    });
});
