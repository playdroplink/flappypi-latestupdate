// Audit logging service for security monitoring
export const AuditService = {
  // Log security-relevant events (simplified version without dedicated audit table)
  logSecurityEvent: async (
    eventType: 'login' | 'purchase' | 'score_submit' | 'suspicious_activity',
    details: Record<string, any> = {}
  ): Promise<void> => {
    try {
      // Only log in production or when specifically enabled
      if (import.meta.env.MODE !== 'production') {
        console.log(`[AUDIT] ${eventType}:`, details);
        return;
      }

      // For now, we'll use ad_watches table for basic audit logging
      // In production, you might want to create a dedicated audit table
      const { error } = await supabase
        .from('ad_watches')
        .insert({
          pi_user_id: details.pi_user_id || 'unknown',
          ad_type: eventType,
          reward_given: JSON.stringify(details),
          watched_at: new Date().toISOString()
        });

      if (error) {
        console.error('Audit logging failed:', error.message);
      }
    } catch (error) {
      console.error('Audit service error:', error);
    }
  },

  // Check for suspicious patterns
  checkSuspiciousActivity: (score: number, sessionDuration: number): boolean => {
    // Flag extremely high scores in short time
    if (score > 500 && sessionDuration < 60) {
      return true;
    }

    // Flag impossible score rates
    if (sessionDuration > 0 && (score / sessionDuration) > 10) {
      return true;
    }

    return false;
  }
};
