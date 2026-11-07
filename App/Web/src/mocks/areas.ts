import { Service, Area } from '../types';

interface SimplifiedAction {
  id: string;
  serviceId: string;
  name: string;
  description: string;
}

export const services: Service[] = [
    { id: '1', name: 'GitHub', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg' },
    { id: '2', name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' },
    { id: '3', name: 'Bitbucket', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Bitbucket-blue-logomark-only.svg' },
    { id: '4', name: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' },
    { id: '5', name: 'Jira', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Jira_%28Software%29_logo.svg' },
    { id: '6', name: 'Slack', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png' },
];


export const data: Area[] = [
    { id: '1', name: 'GitHub PR Monitor', description: 'Monitors pull requests and sends notifications', lastRun: '2024-09-25', services: ['1', '6'], status: 'success' },
    { id: '2', name: 'Slack Channel Alert', description: 'Alerts users via Slack channels on events', lastRun: '2024-09-24', services: ['6', '2'], status: 'failed' },
    { id: '3', name: 'GitLab CI Pipeline', description: 'Triggers on GitLab CI pipeline failures', lastRun: '2024-09-23', services: ['2', '3'], status: 'in progress' },
    { id: '4', name: 'Bitbucket Repo Sync', description: 'Syncs repositories across Bitbucket instances', lastRun: '2024-09-22', services: ['3', '4'], status: 'success' },
    { id: '5', name: 'Azure DevOps Build', description: 'Monitors build statuses in Azure DevOps', lastRun: '2024-09-21', services: ['4', '5'], status: 'success' },
    { id: '6', name: 'Jira Issue Tracker', description: 'Tracks issues in Jira and sends updates', lastRun: '2024-09-20', services: ['5', '1'], status: 'not started' },
];

export const actions: SimplifiedAction[] = [
    { id: '1', serviceId: '1', name: 'Create Pull Request', description: 'Creates a new pull request in a GitHub repository' },
    { id: '2', serviceId: '1', name: 'Close Issue', description: 'Closes an existing issue in a GitHub repository' },
    { id: '3', serviceId: '1', name: 'Push to Repository', description: 'Pushes changes to a GitHub repository' },
    { id: '4', serviceId: '1', name: 'Create Repository', description: 'Creates a new repository on GitHub' },
    { id: '5', serviceId: '2', name: 'Send Email', description: 'Sends an email via Gmail' },
    { id: '6', serviceId: '2', name: 'Create Calendar Event', description: 'Creates a new event in Google Calendar' },
    { id: '7', serviceId: '2', name: 'Upload File to Drive', description: 'Uploads a file to Google Drive' },
    { id: '8', serviceId: '3', name: 'Create Pull Request', description: 'Creates a new pull request in a Bitbucket repository' },
    { id: '9', serviceId: '3', name: 'Merge Pull Request', description: 'Merges an existing pull request in Bitbucket' },
    { id: '10', serviceId: '3', name: 'Create Repository', description: 'Creates a new repository on Bitbucket' },
    { id: '11', serviceId: '4', name: 'Create Playlist', description: 'Creates a new playlist on Spotify' },
    { id: '12', serviceId: '4', name: 'Add Song to Playlist', description: 'Adds a song to an existing Spotify playlist' },
    { id: '13', serviceId: '4', name: 'Play Song', description: 'Starts playing a song on Spotify' },
    { id: '14', serviceId: '5', name: 'Create Issue', description: 'Creates a new issue in Jira' },
    { id: '15', serviceId: '5', name: 'Update Issue', description: 'Updates an existing issue in Jira' },
    { id: '16', serviceId: '5', name: 'Assign Issue', description: 'Assigns an issue to a user in Jira' },
    { id: '17', serviceId: '6', name: 'Send Message', description: 'Sends a message to a Slack channel' },
    { id: '18', serviceId: '6', name: 'Create Channel', description: 'Creates a new channel in Slack' },
    { id: '19', serviceId: '6', name: 'Invite User to Channel', description: 'Invites a user to join a Slack channel' },
];

export const whiteboardCards = [
    { id: '1', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg', serviceName: 'GitHub', event: 'Push to repo', cardName: 'Push to repo', state: 'configuration', x: 100, y: 100, actionId: '3', serviceId: '1', areaId: '1' },
    { id: '2', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg', serviceName: 'Google Drive', event: 'File uploaded', cardName: 'File uploaded', state: 'success', x: 300, y: 100, actionId: '7', serviceId: '2', areaId: '3' },
    { id: '3', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Bitbucket-blue-logomark-only.svg', serviceName: 'Bitbucket', event: 'PR merged', cardName: 'PR merged', state: 'failed', x: 500, y: 100, actionId: '9', serviceId: '3', areaId: '4' },
    { id: '4', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', serviceName: 'Spotify', event: 'New playlist', cardName: 'New playlist', state: 'success', x: 700, y: 100, actionId: 11, serviceId: 4, areaId: 5 },
    { id: '5', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Jira_%28Software%29_logo.svg', serviceName: 'Jira', event: 'Issue created', cardName: 'Issue created', state: 'configuration', x: 100, y: 250, actionId: 14, serviceId: 5, areaId: 1 },
    { id: '6', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png', serviceName: 'Slack', event: 'Message sent', cardName: 'Message sent', state: 'in_progress', x: 300, y: 250, actionId: 17, serviceId: 6, areaId: 2 },
    { id: '7', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg', serviceName: 'GitHub', event: 'Issue closed', cardName: 'Issue closed', state: 'success', x: 500, y: 250, actionId: 2, serviceId: 1, areaId: 1 },
    { id: '8', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg', serviceName: 'Google Calendar', event: 'Event created', cardName: 'Event created', state: 'in_progress', x: 700, y: 250, actionId: 6, serviceId: 2, areaId: 3 },
    { id: '9', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Bitbucket-blue-logomark-only.svg', serviceName: 'Bitbucket', event: 'Repo created', cardName: 'Repo created', state: 'success', x: 100, y: 400, actionId: 10, serviceId: 3, areaId: 4 },
    { id: '10', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', serviceName: 'Spotify', event: 'Song added', cardName: 'Song added', state: 'failed', x: 300, y: 400, actionId: 12, serviceId: 4, areaId: 5 },
    { id: '11', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Jira_%28Software%29_logo.svg', serviceName: 'Jira', event: 'Issue updated', cardName: 'Issue updated', state: 'success', x: 500, y: 400, actionId: 15, serviceId: 5, areaId: 1 },
    { id: '12', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png', serviceName: 'Slack', event: 'Channel created', cardName: 'Channel created', state: 'configuration', x: 700, y: 400, actionId: 18, serviceId: 6, areaId: 2 },
    { id: '13', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg', serviceName: 'GitHub', event: 'Repo created', cardName: 'Repo created', state: 'in_progress', x: 100, y: 550, actionId: 4, serviceId: 1, areaId: 1 },
    { id: '14', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg', serviceName: 'Gmail', event: 'Email sent', cardName: 'Email sent', state: 'success', x: 300, y: 550, actionId: 5, serviceId: 2, areaId: 3 },
    { id: '15', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Bitbucket-blue-logomark-only.svg', serviceName: 'Bitbucket', event: 'PR created', cardName: 'PR created', state: 'failed', x: 500, y: 550, actionId: 8, serviceId: 3, areaId: 4 },
    { id: '16', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', serviceName: 'Spotify', event: 'Playlist created', cardName: 'Playlist created', state: 'success', x: 700, y: 550, actionId: 11, serviceId: 4, areaId: 5 },
    { id: '17', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Jira_%28Software%29_logo.svg', serviceName: 'Jira', event: 'Issue assigned', cardName: 'Issue assigned', state: 'in_progress', x: 100, y: 700, actionId: 16, serviceId: 5, areaId: 1 },
    { id: '18', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png', serviceName: 'Slack', event: 'User invited', cardName: 'User invited', state: 'success', x: 300, y: 700, actionId: 19, serviceId: 6, areaId: 2 },
    { id: '19', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg', serviceName: 'GitHub', event: 'Commit pushed', cardName: 'Commit pushed', state: 'success', x: 500, y: 700, actionId: 3, serviceId: 1, areaId: 1 },
    { id: '20', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg', serviceName: 'Google Drive', event: 'File shared', cardName: 'File shared', state: 'in_progress', x: 100, y: 850, actionId: 7, serviceId: 2, areaId: 3 },
    { id: '21', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Bitbucket-blue-logomark-only.svg', serviceName: 'Bitbucket', event: 'Branch created', cardName: 'Branch created', state: 'success', x: 300, y: 850, actionId: 10, serviceId: 3, areaId: 4 },
    { id: '22', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', serviceName: 'Spotify', event: 'Song played', cardName: 'Song played', state: 'failed', x: 500, y: 850, actionId: 13, serviceId: 4, areaId: 5 },
    { id: '23', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Jira_%28Software%29_logo.svg', serviceName: 'Jira', event: 'Sprint started', cardName: 'Sprint started', state: 'configuration', x: 700, y: 850, actionId: 14, serviceId: 5, areaId: 1 },
    { id: '24', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png', serviceName: 'Slack', event: 'File uploaded', cardName: 'File uploaded', state: 'success', x: 100, y: 1000, actionId: 17, serviceId: 6, areaId: 2 },
];

export const labelsTextReaction1 = [
    {
        "name": "Text",
        "mandatory": true,
        "type": "text",
        "placeholder": "Enter your name",
    },
    {
        "name": "Number",
        "mandatory": true,
        "type": "number",
        "placeholder": "Enter your age",
    },
    {
        "name": "Drop Menu",
        "mandatory": false,
        "type": "dropdown",
        "options": ["Option 1", "Option 2", "Option 3"],
    },
    {
        "name": "Calendar",
        "mandatory": true,
        "type": "date",
        "placeholder": "Select a date",
    },
];

export const labelsTextReaction2 = [
    {
        "name": "vrai test",
        "mandatory": true,
        "type": "text",
        "placeholder": "Enter your name",
    },
    {
        "name": "vrai number",
        "mandatory": true,
        "type": "number",
        "placeholder": "Enter your age",
    },
];