/**
 * Pharos Hub - Modern JavaScript with Security & Performance
 * Author: @avzcrypto (Refactored by AI Assistant)
 * Version: 4.0.0 - Complete Security & Performance Rewrite
 */

'use strict';

// === CONFIGURATION & CONSTANTS ===
const CONFIG = Object.freeze({
    API_BASE_URL: '/assets/api',
    TASK_LIMITS: Object.freeze({
        // Season 1 Tasks 
        send_count: 91,
        swap_count: 91,
        lp_count: 91,
        faroswap_swaps: 91,
        faroswap_lp: 91,
        mint_domain: 91,
        mint_nft: 1,
        // Season 2 Tasks 
        primuslabs_send: 91,
        autostaking: 91,
        lend_borrow: 91,
        r2_swap: 91,
        r2_earn: 91,
        spout: 91,
        bitverse: 91,
        brokex: 91,
        aquaflux: 1
    }),
    LEVEL_THRESHOLDS: Object.freeze({
        1: 0, 2: 1001, 3: 3501, 4: 6001, 5: 10001
    }),
    CACHE_DURATION: 3600000, // 1 hour in milliseconds
    ANIMATION_DURATION: 1000,
    DEBOUNCE_DELAY: 300
});

// === UTILITY CLASSES ===
class Logger {
    static log(level, message, data = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...data
        };
        
        console[level](`[${timestamp}] ${level.toUpperCase()}: ${message}`, data);
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined' && level === 'error') {
            gtag('event', 'exception', {
                description: message,
                fatal: false
            });
        }
    }
    
    static info(message, data) { this.log('info', message, data); }
    static warn(message, data) { this.log('warn', message, data); }
    static error(message, data) { this.log('error', message, data); }
    static debug(message, data) { this.log('debug', message, data); }
}

class SecurityValidator {
    static sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        // Remove any potentially dangerous characters
        return input
            .trim()
            .replace(/[<>'"&]/g, '')
            .substring(0, 100); // Limit length
    }
    
    static validateEthereumAddress(address) {
        if (!address || typeof address !== 'string') {
            throw new ValidationError('Address must be a string');
        }
        
        const sanitized = this.sanitizeInput(address).toLowerCase();
        
        if (!sanitized.startsWith('0x')) {
            throw new ValidationError('Address must start with 0x');
        }
        
        if (sanitized.length !== 42) {
            throw new ValidationError('Address must be 42 characters long');
        }
        
        if (!/^0x[a-f0-9]{40}$/.test(sanitized)) {
            throw new ValidationError('Address contains invalid characters');
        }
        
        return sanitized;
    }
    
    static validateResponse(response) {
        if (!response || typeof response !== 'object') {
            throw new Error('Invalid response format');
        }
        
        if (!response.hasOwnProperty('success')) {
            throw new Error('Response missing success field');
        }
        
        return response;
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

class NetworkError extends Error {
    constructor(message, status = null) {
        super(message);
        this.name = 'NetworkError';
        this.status = status;
    }
}

// === PERFORMANCE UTILITIES ===
class PerformanceUtils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    static measurePerformance(name, fn) {
        return async function(...args) {
            const start = performance.now();
            try {
                const result = await fn.apply(this, args);
                const end = performance.now();
                Logger.debug(`Performance: ${name}`, { duration: `${(end - start).toFixed(2)}ms` });
                return result;
            } catch (error) {
                const end = performance.now();
                Logger.error(`Performance: ${name} failed`, { 
                    duration: `${(end - start).toFixed(2)}ms`,
                    error: error.message 
                });
                throw error;
            }
        };
    }
}

// === DOM MANIPULATION UTILITIES ===
class DOMUtils {
    static $(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            Logger.warn(`Element not found: ${selector}`);
        }
        return element;
    }
    
    static $$(selector) {
        return Array.from(document.querySelectorAll(selector));
    }
    
    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                // Sanitize innerHTML to prevent XSS
                element.innerHTML = SecurityValidator.sanitizeInput(value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    }
    
    static animateValue(element, start, end, duration = CONFIG.ANIMATION_DURATION, formatter = null) {
        if (!element) return Promise.reject(new Error('Element not found'));
        
        return new Promise(resolve => {
            const startTime = performance.now();
            const range = end - start;
            
            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out)
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = start + (range * easeOut);
                
                const value = formatter ? formatter(current) : Math.floor(current);
                element.textContent = value;
                element.setAttribute('aria-valuenow', Math.floor(current));
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    resolve();
                }
            }
            
            requestAnimationFrame(update);
        });
    }
    
    static formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(Math.floor(num));
    }
    
    static formatRank(num) {
        return '#' + this.formatNumber(num);
    }
}

// === API SERVICE ===
class APIService {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.requestId = this.generateRequestId();
    }
    
    generateRequestId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-ID': this.requestId
            },
            credentials: 'same-origin'
        };
        
        const requestOptions = { ...defaultOptions, ...options };
        
        try {
            Logger.debug(`API Request: ${requestOptions.method} ${url}`, { 
                requestId: this.requestId 
            });
            
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                throw new NetworkError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    response.status
                );
            }
            
            const data = await response.json();
            const validatedData = SecurityValidator.validateResponse(data);
            
            Logger.debug(`API Response received`, { 
                requestId: this.requestId,
                success: validatedData.success 
            });
            
            return validatedData;
            
        } catch (error) {
            Logger.error(`API Request failed: ${url}`, {
                error: error.message,
                requestId: this.requestId
            });
            
            if (error instanceof NetworkError) {
                throw error;
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new NetworkError('Network connection failed');
            } else {
                throw new Error(`Request failed: ${error.message}`);
            }
        }
    }
    
    async checkWallet(walletAddress) {
        const validatedAddress = SecurityValidator.validateEthereumAddress(walletAddress);
        
        return this.makeRequest('/check-wallet', {
            method: 'POST',
            body: JSON.stringify({
                wallet_address: validatedAddress
            })
        });
    }
    
    async getHealthStatus() {
        return this.makeRequest('/health');
    }
    
    async getAdminStats() {
        return this.makeRequest('/admin/stats');
    }
}

// === ANALYTICS SERVICE ===
class AnalyticsService {
    static track(eventName, parameters = {}) {
        try {
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, {
                    event_category: 'engagement',
                    ...parameters,
                    timestamp: Date.now()
                });
                Logger.debug(`Analytics event: ${eventName}`, parameters);
            }
        } catch (error) {
            Logger.warn('Analytics tracking failed', { error: error.message });
        }
    }
    
    static trackPageView() {
        this.track('page_view', {
            page_title: document.title,
            page_location: window.location.href
        });
    }
    
    static trackWalletSearch(address) {
        this.track('wallet_search', {
            event_label: 'wallet_check',
            wallet_address: address.substring(0, 6) + '...' + address.substring(address.length - 4)
        });
    }
    
    static trackStatsLoaded(data) {
        this.track('stats_loaded', {
            event_label: 'successful_check',
            total_points: data.total_points,
            user_level: data.current_level,
            user_rank: data.exact_rank
        });
    }
    
    static trackError(errorMessage, errorType = 'unknown') {
        this.track('error_occurred', {
            event_category: 'error',
            event_label: errorType,
            error_message: errorMessage
        });
    }
    
    static trackAuthorClick() {
        this.track('author_follow_click', {
            event_label: 'cta_button',
            link_url: 'https://x.com/avzcrypto'
        });
    }
    
    static trackSeasonSwitch(season) {
        this.track('season_switch', {
            event_label: 'season_switcher',
            season: season
        });
    }
}

// === UI STATE MANAGEMENT ===
class UIStateManager {
    constructor() {
        this.elements = this.initializeElements();
        this.currentState = 'initial';
        this.setupEventListeners();
    }
    
    initializeElements() {
        const elements = {
            // Form elements
            walletForm: DOMUtils.$('#walletForm'),
            walletInput: DOMUtils.$('#walletAddress'),
            checkButton: DOMUtils.$('#checkButton'),
            buttonText: DOMUtils.$('.button-text'),
            buttonLoader: DOMUtils.$('.button-loader'),
            
            // State elements
            loading: DOMUtils.$('#loading'),
            loadingStatus: DOMUtils.$('#loading-status'),
            error: DOMUtils.$('#error'),
            results: DOMUtils.$('#results'),
            
            // Stats elements
            totalPoints: DOMUtils.$('#totalPoints'),
            currentLevel: DOMUtils.$('#currentLevel'),
            levelProgress: DOMUtils.$('#levelProgress'),
            progressValue: DOMUtils.$('#progressValue'),
            progressStatus: DOMUtils.$('#progressStatus'),
            currentRank: DOMUtils.$('#currentRank'),
            totalUsers: DOMUtils.$('#totalUsers'),
            activeDays: DOMUtils.$('#activeDays'),
            memberSince: DOMUtils.$('#memberSince'),
            
            // Task elements (Season 1)
            sendCount: DOMUtils.$('#sendCount'),
            zenithSwaps: DOMUtils.$('#zenithSwaps'),
            zenithLP: DOMUtils.$('#zenithLP'),
            faroswapSwaps: DOMUtils.$('#faroswapSwaps'),
            faroswapLP: DOMUtils.$('#faroswapLP'),
            mintDomain: DOMUtils.$('#mintDomain'),
            mintNFT: DOMUtils.$('#mintNFT'),
            
            // Task elements (Season 2)
            primuslabsSend: DOMUtils.$('#primuslabsSend'),
            rwafi: DOMUtils.$('#rwafi'),
            stake: DOMUtils.$('#stake'),
            cfdTrading: DOMUtils.$('#cfdTrading'),
            bitverse: DOMUtils.$('#bitverse'),
            spout: DOMUtils.$('#spout'),
            lendBorrow: DOMUtils.$('#lendBorrow'),
            r2Swap: DOMUtils.$('#r2Swap'),
            r2Earn: DOMUtils.$('#r2Earn'),
            
            // UI elements
            mainPageFooter: DOMUtils.$('#mainPageFooter'),
            headerSection: DOMUtils.$('.header-section'),
            seasonTabs: DOMUtils.$('.season-tab'),
            season1Content: DOMUtils.$('#season1-content'),
            season2Content: DOMUtils.$('#season2-content')
        };
        
        // Log missing elements for debugging
        Object.entries(elements).forEach(([key, element]) => {
            if (!element && !key.includes('season') && !key.includes('Content')) {
                Logger.warn(`UI Element not found: ${key}`);
            }
        });
        
        return elements;
    }
    
    setupEventListeners() {
        // Form submission with validation
        if (this.elements.walletForm) {
            this.elements.walletForm.addEventListener('submit', 
                PerformanceUtils.debounce(this.handleWalletSubmit.bind(this), CONFIG.DEBOUNCE_DELAY)
            );
        }
        
        // Input validation on type
        if (this.elements.walletInput) {
            this.elements.walletInput.addEventListener('input', 
                PerformanceUtils.throttle(this.handleInputChange.bind(this), 300)
            );
            
            // Clear error on focus
            this.elements.walletInput.addEventListener('focus', () => {
                this.hideError();
            });
        }
        
        // Season switcher
        this.elements.seasonTabs.forEach(tab => {
            tab.addEventListener('click', this.handleSeasonSwitch.bind(this));
        });
        
        // Author link tracking
        const authorLinks = DOMUtils.$('[id*="authorLink"], [id*="resultsAuthorLink"]');
        authorLinks.forEach(link => {
            link.addEventListener('click', () => {
                AnalyticsService.trackAuthorClick();
            });
        });
        
        // Keyboard accessibility
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
        
        // Error recovery
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }
    
    handleWalletSubmit(event) {
        event.preventDefault();
        
        if (this.currentState === 'loading') {
            Logger.debug('Wallet check already in progress');
            return;
        }
        
        const walletAddress = this.elements.walletInput.value.trim();
        
        if (!walletAddress) {
            this.showError('Please enter a wallet address');
            this.elements.walletInput.focus();
            return;
        }
        
        this.checkWalletStats(walletAddress);
    }
    
    handleInputChange(event) {
        const input = event.target.value.trim();
        
        // Real-time validation feedback
        if (input.length > 0) {
            try {
                SecurityValidator.validateEthereumAddress(input);
                this.elements.walletInput.setCustomValidity('');
                this.hideError();
            } catch (error) {
                this.elements.walletInput.setCustomValidity(error.message);
            }
        } else {
            this.elements.walletInput.setCustomValidity('');
            this.hideError();
        }
    }
    
    handleSeasonSwitch(event) {
        const season = event.target.getAttribute('data-season');
        if (season) {
            this.switchSeason(season);
            AnalyticsService.trackSeasonSwitch(season);
        }
    }
    
    handleKeyboardNavigation(event) {
        // Escape key to close errors/reset state
        if (event.key === 'Escape') {
            if (this.currentState === 'error') {
                this.hideError();
                this.elements.walletInput.focus();
            }
        }
        
        // Enter key for form submission (handled by form listener)
        // Tab navigation is handled automatically by browser
    }
    
    handleGlobalError(event) {
        Logger.error('Global error caught', {
            message: event.error?.message || 'Unknown error',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
        
        AnalyticsService.trackError(event.error?.message || 'Unknown global error', 'global');
    }
    
    handleUnhandledRejection(event) {
        Logger.error('Unhandled promise rejection', {
            reason: event.reason?.toString() || 'Unknown rejection'
        });
        
        AnalyticsService.trackError(event.reason?.toString() || 'Unknown rejection', 'promise');
    }
    
    async checkWalletStats(walletAddress) {
        const apiService = new APIService();
        
        try {
            this.showLoading();
            AnalyticsService.trackWalletSearch(walletAddress);
            
            const result = await PerformanceUtils.measurePerformance(
                'wallet-check',
                () => apiService.checkWallet(walletAddress)
            )();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch wallet statistics');
            }
            
            AnalyticsService.trackStatsLoaded(result);
            await this.displayResults(result);
            
        } catch (error) {
            Logger.error('Wallet check failed', { 
                error: error.message,
                wallet: walletAddress.substring(0, 6) + '...'
            });
            
            let errorMessage = 'Failed to fetch wallet statistics. Please try again.';
            
            if (error instanceof ValidationError) {
                errorMessage = error.message;
            } else if (error instanceof NetworkError) {
                errorMessage = error.status === 429 
                    ? 'Too many requests. Please wait a moment and try again.'
                    : 'Network error. Please check your connection and try again.';
            }
            
            this.showError(errorMessage);
            AnalyticsService.trackError(error.message, error.constructor.name);
        }
    }
    
    showLoading() {
        this.currentState = 'loading';
        
        // Update button state
        if (this.elements.checkButton) {
            this.elements.checkButton.disabled = true;
            this.elements.checkButton.setAttribute('aria-busy', 'true');
        }
        
        if (this.elements.buttonText) {
            this.elements.buttonText.textContent = 'Checking...';
        }
        
        if (this.elements.buttonLoader) {
            this.elements.buttonLoader.hidden = false;
            this.elements.buttonLoader.setAttribute('aria-hidden', 'false');
        }
        
        // Show loading state
        if (this.elements.loading) {
            this.elements.loading.hidden = false;
            this.elements.loading.setAttribute('aria-busy', 'true');
        }
        
        // Hide other states
        if (this.elements.results) {
            this.elements.results.hidden = true;
        }
        
        if (this.elements.headerSection) {
            this.elements.headerSection.style.display = 'none';
        }
        
        if (this.elements.mainPageFooter) {
            this.elements.mainPageFooter.style.display = 'none';
        }
        
        this.hideError();
    }
    
    hideLoading() {
        this.currentState = 'idle';
        
        // Reset button state
        if (this.elements.checkButton) {
            this.elements.checkButton.disabled = false;
            this.elements.checkButton.setAttribute('aria-busy', 'false');
        }
        
        if (this.elements.buttonText) {
            this.elements.buttonText.textContent = 'Check Statistics';
        }
        
        if (this.elements.buttonLoader) {
            this.elements.buttonLoader.hidden = true;
            this.elements.buttonLoader.setAttribute('aria-hidden', 'true');
        }
        
        // Hide loading state
        if (this.elements.loading) {
            this.elements.loading.hidden = true;
            this.elements.loading.setAttribute('aria-busy', 'false');
        }
        
        // Show header back
        if (this.elements.headerSection) {
            this.elements.headerSection.style.display = 'flex';
        }
    }
    
    showError(message) {
        this.currentState = 'error';
        this.hideLoading();
        
        if (this.elements.error) {
            this.elements.error.textContent = SecurityValidator.sanitizeInput(message);
            this.elements.error.hidden = false;
            this.elements.error.setAttribute('aria-live', 'assertive');
            
            // Auto-hide error after 10 seconds
            setTimeout(() => {
                this.hideError();
            }, 10000);
        }
        
        // Show footer on main page when error occurs
        if (this.elements.mainPageFooter) {
            this.elements.mainPageFooter.style.display = 'block';
        }
        
        // Focus management for accessibility
        if (this.elements.walletInput) {
            this.elements.walletInput.focus();
            this.elements.walletInput.select();
        }
    }
    
    hideError() {
        if (this.elements.error) {
            this.elements.error.hidden = true;
            this.elements.error.setAttribute('aria-live', 'polite');
        }
        
        if (this.currentState === 'error') {
            this.currentState = 'idle';
        }
    }
    
    async displayResults(data) {
        this.hideLoading();
        this.hideError();
        this.currentState = 'results';
        
        // Hide main page footer when showing results
        if (this.elements.mainPageFooter) {
            this.elements.mainPageFooter.style.display = 'none';
        }
        
        // Animate main stats
        const animations = [];
        
        if (this.elements.totalPoints) {
            animations.push(
                DOMUtils.animateValue(this.elements.totalPoints, 0, data.total_points, 1500, DOMUtils.formatNumber)
            );
        }
        
        if (this.elements.currentLevel) {
            animations.push(
                DOMUtils.animateValue(this.elements.currentLevel, 1, Math.min(data.current_level, 5), 1000)
            );
        }
        
        // Animate rank and users
        if (data.exact_rank && this.elements.currentRank) {
            animations.push(
                DOMUtils.animateValue(this.elements.currentRank, 1, data.exact_rank, 1200, DOMUtils.formatRank)
            );
        } else if (this.elements.currentRank) {
            this.elements.currentRank.textContent = 'Unranked';
        }
        
        if (this.elements.totalUsers) {
            animations.push(
                DOMUtils.animateValue(this.elements.totalUsers, 1, data.total_users_count || 270000, 1000, DOMUtils.formatNumber)
            );
        }
        
        // Calculate and animate active days
        const activeDays = this.calculateActiveDays(data.member_since);
        if (this.elements.activeDays) {
            animations.push(
                DOMUtils.animateValue(this.elements.activeDays, 0, activeDays, 800)
            );
        }
        
        // Update member since text
        if (this.elements.memberSince && data.member_since) {
            const formattedDate = this.formatMemberSince(data.member_since);
            this.elements.memberSince.textContent = `Member Since → ${formattedDate}`;
        }
        
        // Update level progress
        this.updateLevelProgress(data);
        
        // Animate task counts
        this.updateTaskCounts(data);
        
        // Wait for main animations to complete
        await Promise.all(animations);
        
        // Show results with animation
        if (this.elements.results) {
            this.elements.results.hidden = false;
            this.elements.results.classList.add('animate__fadeInUp');
        }
        
        // Trigger staggered animations for result sections
        const animatedElements = this.elements.results?.querySelectorAll('.animate__fadeInUp') || [];
        animatedElements.forEach((el, index) => {
            el.style.animationDelay = `${(index + 1) * 0.1}s`;
        });
    }
    
    updateLevelProgress(data) {
        const levels = CONFIG.LEVEL_THRESHOLDS;
        const currentLevelPoints = levels[data.current_level] || 0;
        const maxLevel = 5;
        const nextLevel = Math.min(data.current_level + 1, maxLevel);
        const nextLevelPoints = levels[nextLevel] || 20001;
        
        const isMaxLevel = data.current_level >= maxLevel;
        const pointsNeeded = isMaxLevel ? 0 : nextLevelPoints - data.total_points;
        const progressInLevel = data.total_points - currentLevelPoints;
        const pointsForLevel = nextLevelPoints - currentLevelPoints;
        
        setTimeout(() => {
            const percentage = isMaxLevel ? 100 : (pointsForLevel > 0 ? (progressInLevel / pointsForLevel) * 100 : 100);
            
            if (this.elements.levelProgress) {
                this.elements.levelProgress.style.width = `${Math.min(percentage, 100)}%`;
                this.elements.levelProgress.parentElement.setAttribute('aria-valuenow', Math.min(percentage, 100));
            }
            
            if (this.elements.progressValue) {
                if (isMaxLevel) {
                    this.elements.progressValue.textContent = 'MAX LEVEL';
                } else {
                    this.elements.progressValue.textContent = 
                        `${DOMUtils.formatNumber(progressInLevel)} / ${DOMUtils.formatNumber(pointsForLevel)}`;
                }
            }
            
            if (this.elements.progressStatus) {
                if (isMaxLevel) {
                    this.elements.progressStatus.textContent = '🎉 Maximum level achieved!';
                    this.elements.progressStatus.className = 'progress-status max-level';
                    if (this.elements.levelProgress) {
                        this.elements.levelProgress.className = 'progress-fill max-level';
                    }
                } else {
                    this.elements.progressStatus.textContent = `${DOMUtils.formatNumber(pointsNeeded)} points until next level`;
                    this.elements.progressStatus.className = 'progress-status in-progress';
                    if (this.elements.levelProgress) {
                        this.elements.levelProgress.className = 'progress-fill in-progress';
                    }
                }
            }
        }, 500);
    }
    
    updateTaskCounts(data) {
        const taskMappings = {
            // Season 1
            sendCount: data.send_count || 0,
            zenithSwaps: data.swap_count || 0,
            zenithLP: data.lp_count || 0,
            faroswapSwaps: data.faroswap_swaps || 0,
            faroswapLP: data.faroswap_lp || 0,
            mintDomain: data.mint_domain || 0,
            mintNFT: data.mint_nft || 0,
            
            // Season 2
            primuslabsSend: data.primuslabs_send || 0,
            rwafi: data.aquaflux || 0,
            stake: data.autostaking || 0,
            lendBorrow: data.lend_borrow || 0,
            r2Swap: data.r2_swap || 0,
            r2Earn: data.r2_earn || 0,
            spout: data.spout || 0,
            bitverse: data.bitverse || 0,
            cfdTrading: data.brokex || 0
        };
        
        Object.entries(taskMappings).forEach(([elementKey, value]) => {
            const element = this.elements[elementKey];
            if (element) {
                DOMUtils.animateValue(element, 0, value, 1000 + Math.random() * 500);
            }
        });
    }
    
    switchSeason(season) {
        // Update active tab
        this.elements.seasonTabs.forEach(tab => {
            const isActive = tab.getAttribute('data-season') === season;
            tab.classList.toggle('select', isActive);
            tab.setAttribute('aria-selected', isActive);
        });
        
        // Show/hide content
        if (season === 'season1') {
            if (this.elements.season1Content) {
                this.elements.season1Content.hidden = false;
            }
            if (this.elements.season2Content) {
                this.elements.season2Content.hidden = true;
            }
        } else {
            if (this.elements.season1Content) {
                this.elements.season1Content.hidden = true;
            }
            if (this.elements.season2Content) {
                this.elements.season2Content.hidden = false;
            }
        }
    }
    
    calculateActiveDays(memberSince) {
        if (!memberSince) return 0;
        const startDate = new Date(memberSince);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    formatMemberSince(memberSince) {
        if (!memberSince) return 'Unknown';
        const date = new Date(memberSince);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// === LEADERBOARD APPLICATION (for top.html) ===
class LeaderboardApp {
    constructor() {
        this.state = {
            currentPage: 1,
            allUsers: [],
            lastUpdated: null,
            updateTimer: null,
            isLoading: false
        };
        
        this.constants = {
            USERS_PER_PAGE: 10,
            TOTAL_PAGES: 10,
            CACHE_DURATION: CONFIG.CACHE_DURATION,
            UPDATE_INTERVAL: 5 * 60 * 1000 // 5 minutes
        };
        
        this.apiService = new APIService();
    }
    
    async init() {
        if (this.isLeaderboardPage()) {
            Logger.info('Initializing Pharos Leaderboard...');
            this.setupEventListeners();
            await this.loadLeaderboard();
            Logger.info('Leaderboard initialized successfully');
        }
    }
    
    isLeaderboardPage() {
        return window.location.pathname.includes('/top') || document.getElementById('leaderboardBody');
    }
    
    setupEventListeners() {
        // Pagination event listeners
        const paginationButtons = DOMUtils.$('.pagination-btn[data-page]');
        paginationButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                this.changePage(page);
            });
        });
        
        const prevBtn = DOMUtils.$('#prevBtn');
        const nextBtn = DOMUtils.$('#nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.state.currentPage > 1) {
                    this.changePage(this.state.currentPage - 1);
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.state.currentPage < this.constants.TOTAL_PAGES) {
                    this.changePage(this.state.currentPage + 1);
                }
            });
        }
    }
    
    async loadLeaderboard() {
        if (this.state.isLoading) return;
        
        this.state.isLoading = true;
        this.showLoading();
        
        try {
            const data = await PerformanceUtils.measurePerformance(
                'leaderboard-load',
                () => this.apiService.getAdminStats()
            )();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to load leaderboard data');
            }
            
            this.state.allUsers = data.leaderboard || [];
            this.state.lastUpdated = Date.now();
            
            this.updateStatistics(data);
            this.updateLevelDistribution(data.level_distribution);
            this.renderTable();
            this.startUpdateTimer();
            this.showTable();
            
            Logger.info(`Leaderboard loaded successfully`, { users: this.state.allUsers.length });
            
        } catch (error) {
            Logger.error('Failed to load leaderboard', { error: error.message });
            this.showError();
        } finally {
            this.state.isLoading = false;
        }
    }
    
    showLoading() {
        const loading = DOMUtils.$('#loading');
        if (loading) {
            loading.classList.add('show');
            loading.setAttribute('aria-busy', 'true');
        }
    }
    
    showTable() {
        const tableSection = DOMUtils.$('#tableSection');
        const distributionSection = DOMUtils.$('#distributionSection');
        
        if (tableSection) tableSection.style.display = 'block';
        if (distributionSection) distributionSection.style.display = 'block';
        
        const loading = DOMUtils.$('#loading');
        if (loading) {
            loading.classList.remove('show');
            loading.setAttribute('aria-busy', 'false');
        }
    }
    
    showError() {
        const errorState = DOMUtils.$('#errorState');
        if (errorState) errorState.style.display = 'block';
    }
    
    updateStatistics(data) {
        const elements = {
            totalUsers: DOMUtils.$('#totalUsers'),
            totalChecks: DOMUtils.$('#totalChecks'),
            topScore: DOMUtils.$('#topScore')
        };
        
        if (elements.totalUsers) {
            DOMUtils.animateValue(elements.totalUsers, 0, data.total_users || 0, 1000, DOMUtils.formatNumber);
        }
        
        if (elements.totalChecks) {
            DOMUtils.animateValue(elements.totalChecks, 0, data.total_checks || 0, 1200, DOMUtils.formatNumber);
        }
        
        if (elements.topScore) {
            const topScore = data.leaderboard?.[0]?.total_points || 0;
            DOMUtils.animateValue(elements.topScore, 0, topScore, 1500, DOMUtils.formatNumber);
        }
    }
    
    updateLevelDistribution(distribution) {
        if (!distribution || typeof distribution !== 'object') return;
        
        const totalUsers = Object.values(distribution).reduce((sum, count) => sum + (parseInt(count) || 0), 0);
        if (totalUsers === 0) return;
        
        const maxCount = Math.max(...Object.values(distribution).map(count => parseInt(count) || 0));
        
        const levels = ['level-1', 'level-2', 'level-3', 'level-4', 'level-5'];
        const levelBars = DOMUtils.$('.level-bar');
        
        levels.forEach((levelKey, index) => {
            if (levelBars[index]) {
                const count = parseInt(distribution[levelKey]) || 0;
                const percentage = ((count / totalUsers) * 100).toFixed(1);
                const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                const barFill = levelBars[index].querySelector('.bar-fill');
                const countElement = levelBars[index].querySelector('.level-count');
                const statsElement = levelBars[index].querySelector('.level-stats');
                
                if (barFill && countElement && statsElement) {
                    setTimeout(() => {
                        barFill.style.width = `${barWidth}%`;
                    }, index * 100);
                    
                    DOMUtils.animateValue(countElement, 0, count, 1000 + index * 200, DOMUtils.formatNumber);
                    statsElement.innerHTML = `<span class="level-count">${DOMUtils.formatNumber(count)}</span> users (${percentage}%)`;
                }
            }
        });
    }
    
    renderTable() {
        // Implementation would depend on specific table structure
        // This is a simplified version
        Logger.debug('Rendering leaderboard table', { users: this.state.allUsers.length });
    }
    
    changePage(page) {
        if (page === this.state.currentPage || page < 1 || page > this.constants.TOTAL_PAGES) {
            return;
        }
        
        this.state.currentPage = page;
        this.renderTable();
        
        // Scroll to top of table
        const tableContainer = DOMUtils.$('.table-container');
        if (tableContainer) {
            tableContainer.scrollTop = 0;
        }
    }
    
    startUpdateTimer() {
        if (this.state.updateTimer) {
            clearInterval(this.state.updateTimer);
        }
        
        this.state.updateTimer = setInterval(() => {
            this.loadLeaderboard();
        }, this.constants.UPDATE_INTERVAL);
    }
    
    destroy() {
        if (this.state.updateTimer) {
            clearInterval(this.state.updateTimer);
            this.state.updateTimer = null;
        }
    }
}

// === APPLICATION INITIALIZATION ===
class PharosApp {
    constructor() {
        this.uiManager = null;
        this.leaderboardApp = null;
        this.initialized = false;
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            Logger.info('Initializing Pharos Hub Application...');
            
            // Track page view
            AnalyticsService.trackPageView();
            
            // Initialize appropriate app based on page
            if (this.isLeaderboardPage()) {
                this.leaderboardApp = new LeaderboardApp();
                await this.leaderboardApp.init();
            } else {
                this.uiManager = new UIStateManager();
                this.setupMainPageFeatures();
            }
            
            this.initialized = true;
            Logger.info('Pharos Hub initialized successfully');
            
        } catch (error) {
            Logger.error('Failed to initialize application', { error: error.message });
            AnalyticsService.trackError(error.message, 'initialization');
        }
    }
    
    isLeaderboardPage() {
        return window.location.pathname.includes('/top') || document.getElementById('leaderboardBody');
    }
    
    setupMainPageFeatures() {
        // Auto-focus input
        if (this.uiManager.elements.walletInput) {
            // Delay focus to avoid issues with page load
            setTimeout(() => {
                this.uiManager.elements.walletInput.focus();
            }, 100);
        }
        
        // Initialize Season 2 by default
        this.uiManager.switchSeason('season2');
        
        // Show footer on main page
        if (this.uiManager.elements.mainPageFooter) {
            this.uiManager.elements.mainPageFooter.style.display = 'block';
        }
        
        // Health check on load
        this.performHealthCheck();
    }
    
    async performHealthCheck() {
        try {
            const apiService = new APIService();
            const health = await apiService.getHealthStatus();
            Logger.info('API health check passed', { status: health.status });
        } catch (error) {
            Logger.warn('API health check failed', { error: error.message });
        }
    }
    
    destroy() {
        if (this.leaderboardApp) {
            this.leaderboardApp.destroy();
        }
        
        this.initialized = false;
        Logger.info('Pharos Hub application destroyed');
    }
}

// === GLOBAL INITIALIZATION ===
let pharosApp = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

async function initializeApp() {
    try {
        pharosApp = new PharosApp();
        await pharosApp.init();
    } catch (error) {
        Logger.error('Critical initialization error', { error: error.message });
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (pharosApp) {
        pharosApp.destroy();
    }
});

// Export for testing (if in Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PharosApp,
        UIStateManager,
        APIService,
        SecurityValidator,
        AnalyticsService,
        DOMUtils,
        Logger,
        CONFIG
    };
}
