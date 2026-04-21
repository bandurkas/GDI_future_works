'use client';

import { useEffect } from 'react';
import clarity from '@microsoft/clarity';

/**
 * MicrosoftClarity handles the integration with Microsoft Clarity for session recording 
 * and heatmaps using the official @microsoft/clarity npm package.
 */
export default function MicrosoftClarity() {
    useEffect(() => {
        // Initialize Clarity with the project ID provided by the user
        const projectId = 'wdhsnq3gas';
        
        try {
            clarity.init(projectId);
            // console.log('[Analytics] Microsoft Clarity initialized via NPM');
        } catch (error) {
            console.error('[Analytics] Failed to initialize Microsoft Clarity:', error);
        }
    }, []);

    return null;
}
