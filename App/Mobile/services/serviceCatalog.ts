import { apiClient } from './api';
import type { BackendService, ActionDefinition, FieldData, PropertySchema } from '@/types/areas';
import { ENV } from './api.config';

const USE_MOCK = ENV.USE_MOCK;

export async function getServicesCatalog(): Promise<BackendService[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: '1',
        key: 'github',
        name: 'GitHub',
        auth: 'OAUTH2',
        isActive: true,
        iconLightUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        iconDarkUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      },
      {
        id: '2',
        key: 'gmail',
        name: 'Gmail',
        auth: 'OAUTH2',
        isActive: true,
        iconLightUrl: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r5.png',
        iconDarkUrl: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r5.png',
      },
      {
        id: '3',
        key: 'slack',
        name: 'Slack',
        auth: 'OAUTH2',
        isActive: true,
        iconLightUrl: 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png',
        iconDarkUrl: 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png',
      },
      {
        id: '4',
        key: 'discord',
        name: 'Discord',
        auth: 'OAUTH2',
        isActive: true,
        iconLightUrl: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
        iconDarkUrl: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
      },
      {
        id: '5',
        key: 'trello',
        name: 'Trello',
        auth: 'OAUTH2',
        isActive: true,
        iconLightUrl: 'https://cdn.worldvectorlogo.com/logos/trello.svg',
        iconDarkUrl: 'https://cdn.worldvectorlogo.com/logos/trello.svg',
      },
      {
        id: '6',
        key: 'spotify',
        name: 'Spotify',
        auth: 'OAUTH2',
        isActive: true,
        iconLightUrl: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png',
        iconDarkUrl: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png',
      },
    ];
  }

  return apiClient.get<BackendService[]>('/api/services/catalog');
}

/**
 * Get a specific service by key
 */
export async function getServiceByKey(serviceKey: string): Promise<BackendService | null> {
  const services = await getServicesCatalog();
  return services.find(s => s.key === serviceKey) || null;
}

/**
 * Get all actions/reactions for a specific service
 */
export async function getActionsByServiceKey(serviceKey: string): Promise<ActionDefinition[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockActions: Record<string, ActionDefinition[]> = {
      github: [
        {
          id: 'github-1',
          serviceId: '1',
          serviceKey: 'github',
          serviceName: 'GitHub',
          key: 'on_push',
          name: 'New Push',
          description: 'Triggered when code is pushed to a repository',
          isEventCapable: true,
          isExecutable: false,
          version: 1,
        },
        {
          id: 'github-2',
          serviceId: '1',
          serviceKey: 'github',
          serviceName: 'GitHub',
          key: 'on_pull_request',
          name: 'New Pull Request',
          description: 'Triggered when a pull request is created',
          isEventCapable: true,
          isExecutable: false,
          version: 1,
        },
        {
          id: 'github-3',
          serviceId: '1',
          serviceKey: 'github',
          serviceName: 'GitHub',
          key: 'create_issue',
          name: 'Create Issue',
          description: 'Creates a new issue in a repository',
          isEventCapable: false,
          isExecutable: true,
          version: 1,
        },
        {
          id: 'github-4',
          serviceId: '1',
          serviceKey: 'github',
          serviceName: 'GitHub',
          key: 'add_comment',
          name: 'Add Comment',
          description: 'Adds a comment to an issue or pull request',
          isEventCapable: false,
          isExecutable: true,
          version: 1,
        },
      ],
      gmail: [
        {
          id: 'gmail-1',
          serviceId: '2',
          serviceKey: 'gmail',
          serviceName: 'Gmail',
          key: 'on_email_received',
          name: 'New Email',
          description: 'Triggered when a new email is received',
          isEventCapable: true,
          isExecutable: false,
          version: 1,
        },
        {
          id: 'gmail-2',
          serviceId: '2',
          serviceKey: 'gmail',
          serviceName: 'Gmail',
          key: 'send_email',
          name: 'Send Email',
          description: 'Sends an email',
          isEventCapable: false,
          isExecutable: true,
          version: 1,
        },
        {
          id: 'gmail-3',
          serviceId: '2',
          serviceKey: 'gmail',
          serviceName: 'Gmail',
          key: 'create_draft',
          name: 'Create Draft',
          description: 'Creates an email draft',
          isEventCapable: false,
          isExecutable: true,
          version: 1,
        },
      ],
      slack: [
        {
          id: 'slack-1',
          serviceId: '3',
          serviceKey: 'slack',
          serviceName: 'Slack',
          key: 'on_message',
          name: 'New Message',
          description: 'Triggered when a message is posted',
          isEventCapable: true,
          isExecutable: false,
          version: 1,
        },
        {
          id: 'slack-2',
          serviceId: '3',
          serviceKey: 'slack',
          serviceName: 'Slack',
          key: 'send_message',
          name: 'Send Message',
          description: 'Posts a message to a channel',
          isEventCapable: false,
          isExecutable: true,
          version: 1,
        },
        {
          id: 'slack-3',
          serviceId: '3',
          serviceKey: 'slack',
          serviceName: 'Slack',
          key: 'create_channel',
          name: 'Create Channel',
          description: 'Creates a new Slack channel',
          isEventCapable: false,
          isExecutable: true,
          version: 1,
        },
      ],
      discord: [
        {
          id: 'discord-1',
          serviceId: '4',
          serviceKey: 'discord',
          serviceName: 'Discord',
          key: 'on_message',
          name: 'New Message',
          description: 'Triggered when a message is posted',
          isEventCapable: true,
          isExecutable: false,
          version: 1,
        },
        {
          id: 'discord-2',
          serviceId: '4',
          serviceKey: 'discord',
          serviceName: 'Discord',
          key: 'send_message',
          name: 'Send Message',
          description: 'Sends a message to a channel',
          isEventCapable: false,
          isExecutable: true,
          version: 1,
        },
      ],
      trello: [
        {
          id: 'trello-1',
          serviceId: '5',
          serviceKey: 'trello',
          serviceName: 'Trello',
          key: 'on_card_created',
          name: 'New Card',
          description: 'Triggered when a card is created',
          isEventCapable: true,
          isExecutable: false,
          version: 1,
        },
        {
          id: 'trello-2',
          serviceId: '5',
          serviceKey: 'trello',
          serviceName: 'Trello',
          key: 'create_card',
          name: 'Create Card',
          description: 'Creates a new card in a list',
          isEventCapable: false,
          isExecutable: true,
          version: 1,
        },
        {
          id: 'trello-3',
          serviceId: '5',
          serviceKey: 'trello',
          serviceName: 'Trello',
          key: 'move_card',
          name: 'Move Card',
          description: 'Moves a card to another list',
          isEventCapable: false,
          isExecutable: true,
          version: 1,
        },
      ],
      spotify: [
        {
          id: 'spotify-1',
          serviceId: '6',
          serviceKey: 'spotify',
          serviceName: 'Spotify',
          key: 'on_track_saved',
          name: 'Track Saved',
          description: 'Triggered when you save a track',
          isEventCapable: true,
          isExecutable: false,
          version: 1,
        },
        {
          id: 'spotify-2',
          serviceId: '6',
          serviceKey: 'spotify',
          serviceName: 'Spotify',
          key: 'play_track',
          name: 'Play Track',
          description: 'Plays a specific track',
          isEventCapable: false,
          isExecutable: true,
          version: 1,
        },
        {
          id: 'spotify-3',
          serviceId: '6',
          serviceKey: 'spotify',
          serviceName: 'Spotify',
          key: 'add_to_playlist',
          name: 'Add to Playlist',
          description: 'Adds a track to a playlist',
          isEventCapable: false,
          isExecutable: true,
          version: 1,
        },
      ],
    };
    return mockActions[serviceKey] || [];
  }

  return apiClient.get<ActionDefinition[]>(`/api/action-definitions/service/${encodeURIComponent(serviceKey)}`);
}

/**
 * Get a specific action definition by ID
 */
export async function getActionDefinitionById(actionDefinitionId: string): Promise<ActionDefinition> {
  if (USE_MOCK) {
    return {
      id: actionDefinitionId,
      serviceId: '1',
      serviceKey: 'mock',
      serviceName: 'Mock Service',
      key: 'mock-action',
      name: 'Mock Action',
      description: 'Mock action for testing',
      isEventCapable: true,
      isExecutable: false,
      version: 1,
    };
  }

  return apiClient.get<ActionDefinition>(`/api/action-definitions/${encodeURIComponent(actionDefinitionId)}`);
}

/**
 * Get field definitions from action input schema
 */
export function getActionFieldsFromDefinition(action: ActionDefinition): FieldData[] {
  if (!action.inputSchema || !action.inputSchema.properties) {
    return [];
  }

  const fields: FieldData[] = [];
  const properties = action.inputSchema.properties;
  const required = action.inputSchema.required || [];

  Object.entries(properties).forEach(([fieldName, fieldDef]) => {
    let fieldType: FieldData['type'] = 'text';

    switch (fieldDef.type) {
      case 'string':
        if (fieldDef.format === 'date-time') {
          fieldType = 'datetime';
        } else if (fieldDef.format === 'date') {
          fieldType = 'date';
        } else if (fieldDef.format === 'time') {
          fieldType = 'time';
        } else if (fieldDef.format === 'email') {
          fieldType = 'email';
        } else {
          fieldType = 'text';
        }
        break;
      case 'integer':
      case 'number':
        fieldType = 'number';
        break;
      case 'array':
        fieldType = 'array';
        break;
      default:
        fieldType = 'text';
    }

    fields.push({
      name: fieldName,
      mandatory: required.includes(fieldName),
      type: fieldType,
      format: fieldDef.format,
      description: fieldDef.description,
      placeholder: fieldDef.description || `Enter ${fieldName}`,
      pattern: fieldDef.pattern,
      minLength: fieldDef.minLength,
      maxLength: fieldDef.maxLength,
      minimum: fieldDef.minimum,
      maximum: fieldDef.maximum,
      default: fieldDef.default,
      items: fieldDef.items,
      minItems: fieldDef.minItems,
    });
  });

  return fields;
}

/**
 * Check if an action is an event (trigger)
 */
export function isEventAction(action: ActionDefinition): boolean {
  return action.isEventCapable === true;
}

/**
 * Check if an action is a reaction (executable)
 */
export function isReactionAction(action: ActionDefinition): boolean {
  return action.isExecutable === true;
}

/**
 * Get available events (triggers) for a service
 */
export async function getServiceEvents(serviceKey: string): Promise<ActionDefinition[]> {
  const actions = await getActionsByServiceKey(serviceKey);
  return actions.filter(action => isEventAction(action));
}

/**
 * Get available reactions (actions) for a service
 */
export async function getServiceReactions(serviceKey: string): Promise<ActionDefinition[]> {
  const actions = await getActionsByServiceKey(serviceKey);
  return actions.filter(action => isReactionAction(action));
}
