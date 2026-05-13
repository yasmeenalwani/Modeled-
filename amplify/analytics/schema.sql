-- RDS PostgreSQL Schema for Analytics
-- This is the analytics database schema

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(255) PRIMARY KEY,
    request_id VARCHAR(255),
    model_id VARCHAR(255),
    professional_id VARCHAR(255),
    
    -- Appointment details
    appointment_date DATE,
    appointment_time VARCHAR(50),
    duration INTEGER,
    location VARCHAR(255),
    
    -- Service
    service_type VARCHAR(100),
    service_description TEXT,
    
    -- Payment
    model_fee DECIMAL(10, 2),
    model_payment_status VARCHAR(50),
    professional_fee DECIMAL(10, 2),
    professional_payment_status VARCHAR(50),
    payment_amount DECIMAL(10, 2),
    payment_currency VARCHAR(10) DEFAULT 'usd',
    payment_date TIMESTAMP,
    
    -- Status
    status VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_appointment_date ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_service_type ON bookings(service_type);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_model_id ON bookings(model_id);
CREATE INDEX IF NOT EXISTS idx_bookings_professional_id ON bookings(professional_id);

-- ============================================
-- MODEL REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS model_requests (
    id VARCHAR(255) PRIMARY KEY,
    professional_id VARCHAR(255),
    
    -- Service details
    service_type VARCHAR(100),
    service_description TEXT,
    
    -- When & Where
    requested_date DATE,
    requested_time VARCHAR(50),
    duration INTEGER,
    location VARCHAR(255),
    
    -- Status
    status VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for model_requests
CREATE INDEX IF NOT EXISTS idx_requests_status ON model_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_service_type ON model_requests(service_type);
CREATE INDEX IF NOT EXISTS idx_requests_requested_date ON model_requests(requested_date);
CREATE INDEX IF NOT EXISTS idx_requests_professional_id ON model_requests(professional_id);

-- ============================================
-- MATCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(255) PRIMARY KEY,
    request_id VARCHAR(255),
    model_id VARCHAR(255),
    
    -- Scoring
    match_score DECIMAL(5, 2),
    
    -- Status
    status VARCHAR(50),
    waitlist_position INTEGER,
    booking_id VARCHAR(255),
    
    -- Timestamps
    sent_at TIMESTAMP,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for matches
CREATE INDEX IF NOT EXISTS idx_matches_request_id ON matches(request_id);
CREATE INDEX IF NOT EXISTS idx_matches_model_id ON matches(model_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_match_score ON matches(match_score);
CREATE INDEX IF NOT EXISTS idx_matches_waitlist_position ON matches(waitlist_position);

-- ============================================
-- REVENUE VIEW (Materialized for performance)
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS revenue_summary AS
SELECT 
    DATE_TRUNC('month', appointment_date) as month,
    service_type,
    status,
    COUNT(*) as booking_count,
    SUM(payment_amount) as total_revenue,
    SUM(model_fee) as total_model_fees,
    SUM(professional_fee) as total_professional_fees,
    AVG(payment_amount) as avg_booking_value
FROM bookings
WHERE status IN ('confirmed', 'completed')
GROUP BY DATE_TRUNC('month', appointment_date), service_type, status;

CREATE UNIQUE INDEX IF NOT EXISTS idx_revenue_summary_unique 
ON revenue_summary(month, service_type, status);

-- Refresh function (call periodically)
CREATE OR REPLACE FUNCTION refresh_revenue_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY revenue_summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRENDS VIEW
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS trends_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as requests_created,
    COUNT(CASE WHEN status = 'booked' THEN 1 END) as requests_booked,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as requests_completed,
    AVG(match_score) as avg_match_score,
    COUNT(CASE WHEN status = 'waitlist' THEN 1 END) as waitlist_count
FROM (
    SELECT 
        mr.created_at,
        mr.status,
        m.match_score,
        m.status as match_status
    FROM model_requests mr
    LEFT JOIN matches m ON mr.id = m.request_id
) combined
GROUP BY DATE_TRUNC('day', created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trends_summary_unique 
ON trends_summary(date);

-- ============================================
-- SERVICE PERFORMANCE VIEW
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS service_performance AS
SELECT 
    service_type,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
    AVG(payment_amount) as avg_revenue,
    SUM(payment_amount) as total_revenue,
    AVG(duration) as avg_duration,
    COUNT(DISTINCT model_id) as unique_models,
    COUNT(DISTINCT professional_id) as unique_professionals
FROM bookings
GROUP BY service_type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_service_performance_unique 
ON service_performance(service_type);

-- ============================================
-- MATCH CONVERSION VIEW
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS match_conversion AS
SELECT 
    DATE_TRUNC('week', sent_at) as week,
    COUNT(*) as matches_sent,
    COUNT(CASE WHEN status = 'accepted' THEN 1 END) as matches_accepted,
    COUNT(CASE WHEN status = 'waitlist' THEN 1 END) as matches_waitlisted,
    COUNT(CASE WHEN status = 'declined' THEN 1 END) as matches_declined,
    AVG(match_score) as avg_match_score,
    AVG(CASE WHEN status = 'accepted' THEN match_score END) as avg_accepted_score,
    (COUNT(CASE WHEN status = 'accepted' THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0) * 100) as conversion_rate
FROM matches
WHERE sent_at IS NOT NULL
GROUP BY DATE_TRUNC('week', sent_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_match_conversion_unique 
ON match_conversion(week);

-- ============================================
-- UPDATE TRIGGERS (Auto-update updated_at)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_model_requests_updated_at
    BEFORE UPDATE ON model_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_model_profiles_updated_at
    BEFORE UPDATE ON model_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at
    BEFORE UPDATE ON professionals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MODEL PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS model_profiles (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    location_zip VARCHAR(20),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    photo_analysis_status VARCHAR(50) DEFAULT 'pending',
    identity_verified BOOLEAN DEFAULT false,
    identity_verification_status VARCHAR(50) DEFAULT 'pending',
    
    -- Terms
    terms_accepted BOOLEAN DEFAULT false,
    terms_accepted_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for model_profiles
CREATE INDEX IF NOT EXISTS idx_model_profiles_user_id ON model_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_model_profiles_status ON model_profiles(status);
CREATE INDEX IF NOT EXISTS idx_model_profiles_created_at ON model_profiles(created_at);

-- ============================================
-- PROFESSIONALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS professionals (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    
    -- Professional details
    license_number VARCHAR(255),
    experience_level VARCHAR(50),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    
    -- Terms
    terms_accepted BOOLEAN DEFAULT false,
    terms_accepted_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for professionals
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_professionals_status ON professionals(status);
CREATE INDEX IF NOT EXISTS idx_professionals_created_at ON professionals(created_at);

-- ============================================
-- PARTNERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS partners (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    business_name VARCHAR(255),
    contact_name VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    
    -- Business details
    business_type VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    
    -- Terms
    terms_accepted BOOLEAN DEFAULT false,
    terms_accepted_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for partners
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_created_at ON partners(created_at);

-- ============================================
-- ONBOARDING EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_events (
    id VARCHAR(255) PRIMARY KEY,
    user_type VARCHAR(50), -- 'Model', 'Professional', 'Partner'
    event_type VARCHAR(100), -- 'signup_clicked', 'signup_started', 'step_completed', 'step_abandoned', 'onboarding_completed', 'onboarding_abandoned'
    step_name VARCHAR(100), -- 'welcome', 'personal_info', 'verification', etc.
    step_number INTEGER,
    session_id VARCHAR(255),
    user_id VARCHAR(255), -- Set when user account is created
    metadata JSONB, -- Additional event data
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for onboarding_events
CREATE INDEX IF NOT EXISTS idx_onboarding_user_type ON onboarding_events(user_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_event_type ON onboarding_events(event_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_session_id ON onboarding_events(session_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON onboarding_events(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_created_at ON onboarding_events(created_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_step ON onboarding_events(step_name, step_number);

-- ============================================
-- ONBOARDING FUNNEL VIEW
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS onboarding_funnel AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    user_type,
    COUNT(DISTINCT CASE WHEN event_type = 'signup_clicked' THEN session_id END) as signups_clicked,
    COUNT(DISTINCT CASE WHEN event_type = 'signup_started' THEN session_id END) as signups_started,
    COUNT(DISTINCT CASE WHEN event_type = 'onboarding_completed' THEN session_id END) as onboarding_completed,
    COUNT(DISTINCT CASE WHEN event_type = 'onboarding_abandoned' THEN session_id END) as onboarding_abandoned,
    -- Step completion rates
    COUNT(DISTINCT CASE WHEN event_type = 'step_completed' AND step_name = 'welcome' THEN session_id END) as completed_welcome,
    COUNT(DISTINCT CASE WHEN event_type = 'step_completed' AND step_name = 'personal_info' THEN session_id END) as completed_personal_info,
    COUNT(DISTINCT CASE WHEN event_type = 'step_completed' AND step_name = 'verification' THEN session_id END) as completed_verification,
    COUNT(DISTINCT CASE WHEN event_type = 'step_completed' AND step_name = 'profile' THEN session_id END) as completed_profile,
    -- Calculate conversion rates
    (COUNT(DISTINCT CASE WHEN event_type = 'onboarding_completed' THEN session_id END)::DECIMAL / 
     NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'signup_clicked' THEN session_id END), 0) * 100) as completion_rate,
    (COUNT(DISTINCT CASE WHEN event_type = 'signup_started' THEN session_id END)::DECIMAL / 
     NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'signup_clicked' THEN session_id END), 0) * 100) as start_rate
FROM onboarding_events
GROUP BY DATE_TRUNC('day', created_at), user_type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_onboarding_funnel_unique 
ON onboarding_funnel(date, user_type);

-- ============================================
-- ONBOARDING STEP DROPOFF VIEW
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS onboarding_dropoff AS
SELECT 
    user_type,
    step_name,
    step_number,
    COUNT(DISTINCT CASE WHEN event_type = 'step_completed' THEN session_id END) as completed,
    COUNT(DISTINCT CASE WHEN event_type = 'step_abandoned' THEN session_id END) as abandoned,
    COUNT(DISTINCT CASE WHEN event_type = 'step_completed' THEN session_id END) + 
    COUNT(DISTINCT CASE WHEN event_type = 'step_abandoned' THEN session_id END) as total_reached,
    (COUNT(DISTINCT CASE WHEN event_type = 'step_abandoned' THEN session_id END)::DECIMAL / 
     NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'step_completed' THEN session_id END) + 
            COUNT(DISTINCT CASE WHEN event_type = 'step_abandoned' THEN session_id END), 0) * 100) as dropoff_rate
FROM onboarding_events
WHERE step_name IS NOT NULL
GROUP BY user_type, step_name, step_number
ORDER BY user_type, step_number;

CREATE UNIQUE INDEX IF NOT EXISTS idx_onboarding_dropoff_unique 
ON onboarding_dropoff(user_type, step_name, step_number);

-- Refresh function for onboarding views
CREATE OR REPLACE FUNCTION refresh_onboarding_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY onboarding_funnel;
    REFRESH MATERIALIZED VIEW CONCURRENTLY onboarding_dropoff;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ENGAGEMENT EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS engagement_events (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    user_type VARCHAR(50), -- 'Model', 'Professional', 'Partner'
    event_type VARCHAR(100) NOT NULL, -- 'session_start', 'session_end', 'game_started', 'game_completed', 'quiz_completed', 'booking_intent_created', 'booking_confirmed', 'waitlist_joined', 'waitlist_converted', 'profile_viewed', 'feature_used', etc.
    event_category VARCHAR(50), -- 'session', 'feature', 'booking', 'learning', 'social'
    
    -- Feature-specific data
    feature_name VARCHAR(100), -- 'hair_damage_quiz', 'color_matching_game', 'profile_edit', etc.
    feature_type VARCHAR(50), -- 'game', 'quiz', 'learning_module', 'profile', 'booking', etc.
    
    -- Booking/marketplace data
    booking_id VARCHAR(255),
    request_id VARCHAR(255),
    waitlist_id VARCHAR(255),
    intent_type VARCHAR(50), -- 'booking', 'availability', 'interest'
    
    -- Session data
    session_id VARCHAR(255),
    session_duration INTEGER, -- seconds
    page_path VARCHAR(500),
    
    -- Engagement metrics
    completion_status VARCHAR(50), -- 'completed', 'abandoned', 'in_progress'
    score INTEGER, -- For games/quizzes
    metadata JSONB, -- Additional event data
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for engagement_events
CREATE INDEX IF NOT EXISTS idx_engagement_user_id ON engagement_events(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_user_type ON engagement_events(user_type);
CREATE INDEX IF NOT EXISTS idx_engagement_event_type ON engagement_events(event_type);
CREATE INDEX IF NOT EXISTS idx_engagement_event_category ON engagement_events(event_category);
CREATE INDEX IF NOT EXISTS idx_engagement_session_id ON engagement_events(session_id);
CREATE INDEX IF NOT EXISTS idx_engagement_created_at ON engagement_events(created_at);
CREATE INDEX IF NOT EXISTS idx_engagement_feature ON engagement_events(feature_name, feature_type);
CREATE INDEX IF NOT EXISTS idx_engagement_booking ON engagement_events(booking_id, request_id);

-- ============================================
-- USER SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    user_type VARCHAR(50),
    session_id VARCHAR(255) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    page_views INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP,
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON user_sessions(started_at);

-- ============================================
-- ENGAGEMENT SUMMARY VIEW
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS engagement_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    user_type,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(DISTINCT session_id) as total_sessions,
    AVG(session_duration) as avg_session_duration,
    COUNT(CASE WHEN event_type = 'session_start' THEN 1 END) as sessions_started,
    COUNT(CASE WHEN event_type = 'game_started' THEN 1 END) as games_started,
    COUNT(CASE WHEN event_type = 'game_completed' THEN 1 END) as games_completed,
    COUNT(CASE WHEN event_type = 'quiz_completed' THEN 1 END) as quizzes_completed,
    COUNT(CASE WHEN event_type = 'booking_intent_created' THEN 1 END) as booking_intents,
    COUNT(CASE WHEN event_type = 'booking_confirmed' THEN 1 END) as bookings_confirmed,
    COUNT(CASE WHEN event_type = 'waitlist_joined' THEN 1 END) as waitlist_joins,
    COUNT(CASE WHEN event_type = 'waitlist_converted' THEN 1 END) as waitlist_conversions
FROM engagement_events
GROUP BY DATE_TRUNC('day', created_at), user_type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_engagement_summary_unique 
ON engagement_summary(date, user_type);

-- ============================================
-- USER ENGAGEMENT METRICS VIEW
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS user_engagement_metrics AS
SELECT 
    user_id,
    user_type,
    COUNT(DISTINCT DATE(created_at)) as days_active,
    COUNT(DISTINCT session_id) as total_sessions,
    AVG(session_duration) as avg_session_duration,
    COUNT(CASE WHEN event_type = 'game_started' THEN 1 END) as games_started,
    COUNT(CASE WHEN event_type = 'game_completed' THEN 1 END) as games_completed,
    COUNT(CASE WHEN event_type = 'quiz_completed' THEN 1 END) as quizzes_completed,
    COUNT(CASE WHEN event_type = 'booking_intent_created' THEN 1 END) as booking_intents,
    COUNT(CASE WHEN event_type = 'booking_confirmed' THEN 1 END) as bookings_confirmed,
    MAX(created_at) as last_active_at,
    MIN(created_at) as first_active_at
FROM engagement_events
GROUP BY user_id, user_type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_engagement_unique 
ON user_engagement_metrics(user_id, user_type);

-- ============================================
-- FEATURE ENGAGEMENT VIEW
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS feature_engagement AS
SELECT 
    feature_name,
    feature_type,
    user_type,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(CASE WHEN event_type LIKE '%_started' THEN 1 END) as starts,
    COUNT(CASE WHEN event_type LIKE '%_completed' THEN 1 END) as completions,
    COUNT(CASE WHEN completion_status = 'abandoned' THEN 1 END) as abandonments,
    (COUNT(CASE WHEN event_type LIKE '%_completed' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN event_type LIKE '%_started' THEN 1 END), 0) * 100) as completion_rate,
    AVG(score) as avg_score
FROM engagement_events
WHERE feature_name IS NOT NULL
GROUP BY feature_name, feature_type, user_type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_feature_engagement_unique 
ON feature_engagement(feature_name, feature_type, user_type);

-- ============================================
-- BOOKING FUNNEL VIEW
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS booking_funnel AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    user_type,
    COUNT(DISTINCT CASE WHEN event_type = 'profile_viewed' THEN user_id END) as profile_views,
    COUNT(DISTINCT CASE WHEN event_type = 'booking_intent_created' THEN user_id END) as booking_intents,
    COUNT(DISTINCT CASE WHEN event_type = 'waitlist_joined' THEN user_id END) as waitlist_joins,
    COUNT(DISTINCT CASE WHEN event_type = 'booking_confirmed' THEN user_id END) as bookings_confirmed,
    COUNT(DISTINCT CASE WHEN event_type = 'waitlist_converted' THEN user_id END) as waitlist_conversions,
    (COUNT(DISTINCT CASE WHEN event_type = 'booking_intent_created' THEN user_id END)::DECIMAL / 
     NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'profile_viewed' THEN user_id END), 0) * 100) as intent_rate,
    (COUNT(DISTINCT CASE WHEN event_type = 'booking_confirmed' THEN user_id END)::DECIMAL / 
     NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'booking_intent_created' THEN user_id END), 0) * 100) as booking_conversion_rate
FROM engagement_events
WHERE event_category = 'booking' OR event_type LIKE 'booking_%' OR event_type LIKE 'waitlist_%' OR event_type = 'profile_viewed'
GROUP BY DATE_TRUNC('day', created_at), user_type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_funnel_unique 
ON booking_funnel(date, user_type);

-- Refresh function for engagement views
CREATE OR REPLACE FUNCTION refresh_engagement_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY engagement_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_engagement_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY feature_engagement;
    REFRESH MATERIALIZED VIEW CONCURRENTLY booking_funnel;
END;
$$ LANGUAGE plpgsql;

