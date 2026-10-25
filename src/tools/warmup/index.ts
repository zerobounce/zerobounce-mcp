/**
 * The 26 ZeroBounce Warmup tools (operations 49-74).
 *
 * All of them need the Warmup API key, which is separate from the validation
 * key, so `getAllTools()` leaves them out unless one is configured.
 */

import type { ToolHandler } from '../types.js';
import {
  warmupListSendingAccountsTool,
  warmupGetSendingAccountTool,
  warmupAddSendingAccountTool,
  warmupUpdateSendingAccountTool,
  warmupDeleteSendingAccountTool,
  warmupChangeFromAddressTool,
  warmupListFromAddressesTool,
} from './sending-accounts.js';
import {
  warmupGetEngagementRulesTool,
  warmupSetEngagementRuleTool,
  warmupGetCustomEngagementTool,
  warmupCreateCustomEngagementTool,
  warmupUpdateCustomEngagementTool,
  warmupDeleteCustomEngagementTool,
} from './engagement.js';
import {
  warmupGetSeedsTool,
  warmupDownloadSeedsTool,
  warmupGetSeedCountTool,
  warmupGetProgressTodayTool,
  warmupGetSentTodayTool,
  warmupGetEmailsPerDayTool,
  warmupGetStatisticsTool,
  warmupGetStatisticsPerDayTool,
  warmupGetStatisticsDetailedTool,
  warmupDownloadStatisticsTool,
  warmupGetFromAddressStatisticsTool,
} from './insights.js';
import { warmupCheckDomainDmarcTool, warmupTestSmtpConfigurationTool } from './diagnostics.js';

export const warmupTools: ToolHandler[] = [
  // Sending accounts (49-55)
  warmupListSendingAccountsTool,
  warmupGetSendingAccountTool,
  warmupAddSendingAccountTool,
  warmupUpdateSendingAccountTool,
  warmupDeleteSendingAccountTool,
  warmupChangeFromAddressTool,
  warmupListFromAddressesTool,
  // Engagement rules (56-61)
  warmupGetEngagementRulesTool,
  warmupSetEngagementRuleTool,
  warmupGetCustomEngagementTool,
  warmupCreateCustomEngagementTool,
  warmupUpdateCustomEngagementTool,
  warmupDeleteCustomEngagementTool,
  // Seeds, progress and statistics (62-72)
  warmupGetSeedsTool,
  warmupDownloadSeedsTool,
  warmupGetSeedCountTool,
  warmupGetProgressTodayTool,
  warmupGetSentTodayTool,
  warmupGetEmailsPerDayTool,
  warmupGetStatisticsTool,
  warmupGetStatisticsPerDayTool,
  warmupGetStatisticsDetailedTool,
  warmupDownloadStatisticsTool,
  warmupGetFromAddressStatisticsTool,
  // Diagnostics (73-74)
  warmupCheckDomainDmarcTool,
  warmupTestSmtpConfigurationTool,
];
