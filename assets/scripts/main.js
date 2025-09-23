/**
 * Pharos Hub - Main JavaScript
 * Author: @avzcrypto
 * Version: 2.0 - Restructured and Optimized
 */

// === CONFIGURATION ===
const TASK_LIMITS = {
    // Season 1 Tasks 
    'send_count': 91,
    'swap_count': 91,           // Zenith Swaps
    'lp_count': 91,             // Zenith LP  
    'faroswap_swaps': 91,
    'faroswap_lp': 91,
    'mint_domain': 91,
    'mint_nft': 1, 

    // Season 2 Tasks 
    'primuslabs_send': 91,
    'autostaking': 91,          // Stake
    'lend_borrow': 91,
    'r2_swap': 91,
    'r2_earn': 91,
    'spout': 91,
    'bitverse': 91,
    'brokex': 91,               // CFD Trading
    'aquaflux': 1    
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
            console.warn('Error parsing member_since date:', error);
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
    sendCount: document.getElementById('sendCount'),
    zenithSwaps: document.getElementById('zenithSwaps'),
    zenithLP: document.getElementById('zenithLP'),
    faroswapSwaps: document.getElementById('faroswapSwaps'),
    faroswapLP: document.getElementById('faroswapLP'),
    mintDomain: document.getElementById('mintDomain'),
    mintNFT: document.getElementById('mintNFT'),
    
    // Season 2 task elements
    primuslabsSend: document.getElementById('primuslabsSend'),
    rwafi: document.getElementById('rwafi'),
    stake: document.getElementById('stake'),
    cfdTrading: document.getElementById('cfdTrading'),
    bitverse: document.getElementById('bitverse'),
    spout: document.getElementById('spout'),
    lendBorrow: document.getElementById('lendBorrow'),
    r2Swap: document.getElementById('r2Swap'),
    r2Earn: document.getElementById('r2Earn'),
    
    // UI elements
    mainPageFooter: document.getElementById('mainPageFooter'),
    headerSection: document.querySelector('.header-section')
};

// === ANALYTICS FUNCTIONS ===
const Analytics = {
    trackPageView() {
        gtag('event', 'page_view', {
            page_title: 'Pharos Stats Checker',
            page_location: window.location.href
        });
    },

    trackWalletSearch(address) {
        gtag('event', 'wallet_search', {
            event_category: 'engagement',
            event_label: 'wallet_check',
            wallet_address: address.substring(0, 6) + '...' + address.substring(address.length - 4)
        });
    },

    trackStatsLoaded(data) {
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
    },

    trackAuthorClick() {
        gtag('event', 'author_follow_click_neomorphic', {
            event_category: 'engagement',
            event_label: 'neomorphic_cta_button',
            link_url: 'https://x.com/avzcrypto',
            button_style: 'neomorphic_follow_me'
        });
    },

    trackSeasonSwitch(season) {
        gtag('event', 'season_switch', {
            event_category: 'engagement',
            event_label: 'season_switcher',
            season: season
        });
    },

    trackError(errorMessage) {
        gtag('event', 'error_occurred', {
            event_category: 'error',
            event_label: 'wallet_check_failed',
            error_message: errorMessage
        });
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
        DOMElements.error.textContent = message;
        DOMElements.error.classList.add('show');
        DOMElements.loading.classList.remove('show');
        DOMElements.results.classList.remove('show');
        
        // Show footer on main page when error occurs
        if (DOMElements.mainPageFooter) {
            DOMElements.mainPageFooter.style.display = 'block';
        }
        
        // Track error
        Analytics.trackError(message);
    },

    hideError() {
        DOMElements.error.classList.remove('show');
    },

    showLoading() {
        DOMElements.loading.classList.add('show');
        DOMElements.results.classList.remove('show');
        this.hideError();
        DOMElements.checkButton.disabled = true;
        DOMElements.checkButton.textContent = 'Checking...';
        
        // Hide header section and footer during loading
        if (DOMElements.headerSection) {
            DOMElements.headerSection.style.display = 'none';
        }
        if (DOMElements.mainPageFooter) {
            DOMElements.mainPageFooter.style.display = 'none';
        }
    },

    hideLoading() {
        DOMElements.loading.classList.remove('show');
        DOMElements.checkButton.disabled = false;
        DOMElements.checkButton.textContent = 'Check Statistics';
        
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

        // Show/hide content
        const season1Content = document.getElementById('season1-content');
        const season2Content = document.getElementById('season2-content');
        
        if (season === 'season1') {
            if (season1Content) season1Content.style.display = 'block';
            if (season2Content) season2Content.style.display = 'none';
        } else {
            if (season1Content) season1Content.style.display = 'none';
            if (season2Content) season2Content.style.display = 'block';
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
        const address = DOMElements.walletInput.value.trim();

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
            console.error('Error:', err);
            UIState.showError(err.message || 'Failed to fetch wallet statistics. Please try again.');
        } finally {
            UIState.hideLoading();
        }
    },

    displayResults(data) {
        UIState.hideError();

        const maxLevel = 5;

        // Animate main stats with level cap
        Utils.animateValue(DOMElements.totalPoints, 0, data.total_points);
        Utils.animateValue(DOMElements.currentLevel, 1, Math.min(data.current_level, maxLevel));
        
        // Animate rank
        if (data.exact_rank && DOMElements.currentRank) {
            Utils.animateRank(DOMElements.currentRank, 1, data.exact_rank);
            Utils.animateValue(DOMElements.totalUsers, 1, data.total_users_count || 270000);
        } else if (DOMElements.currentRank) {
            DOMElements.currentRank.textContent = 'Unranked';
            Utils.animateValue(DOMElements.totalUsers, 1, data.total_users_count || 270000);
        }
        
        // Update member since display
        if (DOMElements.testnetDays && DOMElements.memberSinceDate) {
        const memberData = MemberSinceUtils.formatMemberSince(data.member_since);
        Utils.animateValue(DOMElements.testnetDays, 0, memberData.days);
        DOMElements.memberSinceDate.textContent = `Since ${memberData.formattedDate}`;
        }

       // Update level progress bar
if (DOMElements.levelProgress) {
    const currentLevel = Math.min(data.current_level, 5);
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
        TaskProgress.updateTaskWithProgress('send_count', DOMElements.sendCount, data.send_count || 0);
        TaskProgress.updateTaskWithProgress('swap_count', DOMElements.zenithSwaps, data.swap_count || 0);
        TaskProgress.updateTaskWithProgress('lp_count', DOMElements.zenithLP, data.lp_count || 0);
        TaskProgress.updateTaskWithProgress('faroswap_swaps', DOMElements.faroswapSwaps, data.faroswap_swaps || 0);
        TaskProgress.updateTaskWithProgress('faroswap_lp', DOMElements.faroswapLP, data.faroswap_lp || 0);
        TaskProgress.updateTaskWithProgress('mint_domain', DOMElements.mintDomain, data.mint_domain || 0);
        TaskProgress.updateTaskWithProgress('mint_nft', DOMElements.mintNFT, data.mint_nft || 0);

        // Season 2 tasks with progress bars
        if (DOMElements.primuslabsSend) TaskProgress.updateTaskWithProgress('primuslabs_send', DOMElements.primuslabsSend, data.primuslabs_send || 0);
        if (DOMElements.stake) TaskProgress.updateTaskWithProgress('autostaking', DOMElements.stake, data.autostaking || 0);
        if (DOMElements.lendBorrow) TaskProgress.updateTaskWithProgress('lend_borrow', DOMElements.lendBorrow, data.lend_borrow || 0);
        if (DOMElements.rwafi) TaskProgress.updateTaskWithProgress('aquaflux', DOMElements.rwafi, data.aquaflux || 0);
        if (DOMElements.r2Swap) TaskProgress.updateTaskWithProgress('r2_swap', DOMElements.r2Swap, data.r2_swap || 0);
        if (DOMElements.r2Earn) TaskProgress.updateTaskWithProgress('r2_earn', DOMElements.r2Earn, data.r2_earn || 0);
        if (DOMElements.spout) TaskProgress.updateTaskWithProgress('spout', DOMElements.spout, data.spout || 0);
        if (DOMElements.bitverse) TaskProgress.updateTaskWithProgress('bitverse', DOMElements.bitverse, data.bitverse || 0);
        if (DOMElements.cfdTrading) TaskProgress.updateTaskWithProgress('brokex', DOMElements.cfdTrading, data.brokex || 0);

        // Show results with animation
        DOMElements.results.classList.add('show');

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
        const animatedElements = DOMElements.results.querySelectorAll('.animate__fadeInUp');
        animatedElements.forEach((el, index) => {
            el.style.animationDelay = `${(index + 1) * 0.1}s`;
        });
    }
};

// === EVENT LISTENERS ===
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
        
        // Initialize Season 2 by default
        SeasonSwitcher.switchSeason('season2');
        
        // Show footer on main page when loading
        if (DOMElements.mainPageFooter) {
            DOMElements.mainPageFooter.style.display = 'block';
        }

        console.log('✅ Pharos Hub initialized successfully');
    }
};

// === LEADERBOARD SPECIFIC CODE (for top.html) ===
const LeaderboardApp = {
    // State management for leaderboard
    state: {
        currentPage: 1,
        allUsers: [],
        lastUpdated: null,
        updateTimer: null,
        isLoading: false
    },

    constants: {
        USERS_PER_PAGE: 10,
        TOTAL_PAGES: 10,
        CACHE_DURATION: 60 * 60 * 1000, // 1 hour
        LEVEL_STRUCTURE: [
            { name: "Lv.1", min: 0, max: 1000, icon: "./assets/images/level-badges/level1.png" },
            { name: "Lv.2", min: 1001, max: 3500, icon: "./assets/images/level-badges/level2.png" },
            { name: "Lv.3", min: 3501, max: 6000, icon: "./assets/images/level-badges/level3.png" },
            { name: "Lv.4", min: 6001, max: 10000, icon: "./assets/images/level-badges/level4.png" },
            { name: "Lv.5", min: 10001, max: Infinity, icon: "./assets/images/level-badges/level5.png" }
        ]
    },

    // Initialize leaderboard if we're on top.html
    init() {
        if (window.location.pathname.includes('/top') || document.getElementById('leaderboardBody')) {
            console.log('🚀 Initializing Pharos Leaderboard...');
            this.setupEventListeners();
            this.loadLeaderboard();
            console.log('✅ Leaderboard initialized');
        }
    },

    async loadLeaderboard() {
        if (this.state.isLoading) return;
        
        this.state.isLoading = true;
        this.showLoading();

        try {
            const response = await fetch('/assets/api/admin/stats');
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to load data');
            }

            this.state.allUsers = data.leaderboard || [];
            this.state.lastUpdated = Date.now();
            
            this.updateStatistics(data);
            this.updateLevelDistribution(data.level_distribution);
            this.renderTable();
            this.startUpdateTimer();
            this.showTable();

            console.log(`✅ Loaded ${this.state.allUsers.length} users`);

        } catch (error) {
            console.error('❌ Error loading leaderboard:', error);
            this.showError();
        } finally {
            this.state.isLoading = false;
        }
    },

    setupEventListeners() {
        // Pagination event listeners would go here
        // Implementation depends on your specific leaderboard HTML structure
    },

    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.classList.add('show');
    },

    showTable() {
        const tableSection = document.getElementById('tableSection');
        if (tableSection) tableSection.style.display = 'block';
    },

    showError() {
        const errorState = document.getElementById('errorState');
        if (errorState) errorState.style.display = 'block';
    },

    updateStatistics(data) {
        // Update leaderboard statistics
        const totalUsers = document.getElementById('totalUsers');
        const totalChecks = document.getElementById('totalChecks');
        const topScore = document.getElementById('topScore');

        if (totalUsers) totalUsers.textContent = Utils.formatNumber(data.total_users || 0);
        if (totalChecks) totalChecks.textContent = Utils.formatNumber(data.total_checks || 0);
        if (topScore) topScore.textContent = Utils.formatNumber(data.leaderboard?.[0]?.total_points || 0);
    },

    updateLevelDistribution(distribution) {
        // Update level distribution if needed
        console.log('Level distribution:', distribution);
    },

    renderTable() {
        // Render leaderboard table
        // Implementation would depend on your specific table structure
    },

    startUpdateTimer() {
        // Start timer for periodic updates
        if (this.state.updateTimer) {
            clearInterval(this.state.updateTimer);
        }
        
        this.state.updateTimer = setInterval(() => {
            this.loadLeaderboard();
        }, 5 * 60 * 1000); // Update every 5 minutes
    }
};

// === AUTO INITIALIZATION ===
// Initialize the appropriate app based on page context
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/top') || document.getElementById('leaderboardBody')) {
        LeaderboardApp.init();
    } else {
        PharosApp.init();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (LeaderboardApp.state.updateTimer) {
        clearInterval(LeaderboardApp.state.updateTimer);
    }
});
// Tab functionality
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected tab instantly
    document.getElementById(`tab-${tabName}`).classList.add('active');
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
        console.error('Error loading dashboard:', error);
        showDashboardError();
    }
}

function updateDashboardStats(data) {
    document.getElementById('dashboardTotalUsers').textContent = formatNumber(data.total_users || 0);
    document.getElementById('dashboardTotalChecks').textContent = formatNumber(data.total_checks || 0);
    document.getElementById('dashboardTopScore').textContent = formatNumber(data.leaderboard?.[0]?.total_points || 0);
}

function updateLevelDistribution(levelDistribution) {
    if (!levelDistribution || typeof levelDistribution !== 'object') {
        console.log('No level distribution data received');
        return;
    }
    
    const levels = ['level-1', 'level-2', 'level-3', 'level-4', 'level-5'];
    
    // Calculate total for percentages
    const totalUsers = Object.values(levelDistribution).reduce((sum, count) => sum + (parseInt(count) || 0), 0);
    
    if (totalUsers === 0) {
        console.log('Total users is 0, skipping update');
        return;
    }
    
    // Find maximum count for bar width calculation
    const maxCount = Math.max(...Object.values(levelDistribution).map(count => parseInt(count) || 0));
    
    console.log('Updating level distribution:', { totalUsers, maxCount, levelDistribution });
    
    levels.forEach((level, index) => {
        const count = parseInt(levelDistribution[level]) || 0;
        const percentage = ((count / totalUsers) * 100).toFixed(1);
        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
        
        // Find the level bar container for Dashboard
        const levelBars = document.querySelectorAll('#levelBars .level-bar');
        
        if (levelBars[index]) {
            // Update count with percentage - это основное исправление!
            const countElement = levelBars[index].querySelector('.level-count');
            if (countElement) {
                // Меняем текст чтобы включить проценты
                countElement.textContent = `${formatNumber(count)} users (${percentage}%)`;
            }
            
            // Update progress bar
            const progressBar = levelBars[index].querySelector('.level-progress-bar');
            if (progressBar && maxCount > 0) {
                setTimeout(() => {
                    progressBar.style.width = `${barWidth}%`;
                }, index * 200);
            }
            
            console.log(`Level ${index + 1}: ${count} users (${percentage}%) - bar width: ${barWidth}%`);
        } else {
            console.log(`Level bar ${index} not found`);
        }
    });
}

function updateTopUsersTable(leaderboard) {
    const tbody = document.getElementById('dashboardUsersTable');
    if (!leaderboard || leaderboard.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #64748b;">No data available</td></tr>';
        return;
    }
    
    const topUsers = leaderboard.slice(0, 10);
    tbody.innerHTML = topUsers.map((user, index) => {
        const rank = index + 1;
        const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-default';
        
        return `
            <tr>
                <td><div class="rank-badge ${rankClass}">${rank}</div></td>
                <td><div class="user-address">${formatAddress(user.address)}</div></td>
                <td>
                    <div class="points-level">
                        <div class="points">${formatNumber(user.total_points)}</div>
                        <div class="level-badge">LVL ${user.current_level}</div>
                    </div>
                </td>
                <td><div class="member-since">${formatDate(user.member_since)}</div></td>
            </tr>
        `;
    }).join('');
}

function formatAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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

function showDashboardError() {
    document.getElementById('dashboardUsersTable').innerHTML = 
        '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #dc2626;">Failed to load dashboard data</td></tr>';
}

// Load dashboard data when tab is switched
const originalSwitchTab = switchTab;
switchTab = function(tabName) {
    originalSwitchTab.call(this, tabName);
    
    if (tabName === 'dashboard') {
        loadDashboardData();
    }
};


