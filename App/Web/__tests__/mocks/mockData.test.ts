// Test areasService using direct mock data approach
import { data as mockData, services as mockServices, actions as MockActions } from '../../src/mocks/areas';

describe('areasService mock data', () => {
  describe('mock data structure', () => {
    it('should have mock areas data', () => {
      expect(mockData).toBeDefined();
      expect(Array.isArray(mockData)).toBe(true);
      expect(mockData.length).toBeGreaterThan(0);
    });

    it('should have areas with required properties', () => {
      mockData.forEach(area => {
        expect(area).toHaveProperty('id');
        expect(area).toHaveProperty('name');
        expect(area).toHaveProperty('description');
        expect(area).toHaveProperty('status');
        expect(typeof area.name).toBe('string');
      });
    });

    it('should have GitHub PR Monitor area', () => {
      const prMonitor = mockData.find(a => a.name === 'GitHub PR Monitor');
      expect(prMonitor).toBeDefined();
      expect(prMonitor?.description).toContain('pull requests');
    });

    it('should have multiple areas', () => {
      expect(mockData.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('services mock data', () => {
    it('should have services data', () => {
      expect(mockServices).toBeDefined();
      expect(Array.isArray(mockServices)).toBe(true);
      expect(mockServices.length).toBeGreaterThan(0);
    });

    it('should have GitHub service', () => {
      const github = mockServices.find(s => s.name === 'GitHub');
      expect(github).toBeDefined();
      expect(github?.id).toBeDefined();
    });

    it('should have Slack service', () => {
      const slack = mockServices.find(s => s.name === 'Slack');
      expect(slack).toBeDefined();
    });

    it('should have Spotify service', () => {
      const spotify = mockServices.find(s => s.name === 'Spotify');
      expect(spotify).toBeDefined();
    });

    it('should have Jira service', () => {
      const jira = mockServices.find(s => s.name === 'Jira');
      expect(jira).toBeDefined();
    });

    it('should have Bitbucket service', () => {
      const bitbucket = mockServices.find(s => s.name === 'Bitbucket');
      expect(bitbucket).toBeDefined();
    });

    it('should have Google service', () => {
      const google = mockServices.find(s => s.name === 'Google');
      expect(google).toBeDefined();
    });

    it('services should have logo', () => {
      mockServices.forEach(service => {
        expect(service).toHaveProperty('logo');
        expect(typeof service.logo).toBe('string');
      });
    });
  });

  describe('actions mock data', () => {
    it('should have actions data', () => {
      expect(MockActions).toBeDefined();
      expect(Array.isArray(MockActions)).toBe(true);
      expect(MockActions.length).toBeGreaterThan(0);
    });

    it('should have GitHub actions', () => {
      const githubActions = MockActions.filter(a => String(a.serviceId) === '1');
      expect(githubActions.length).toBeGreaterThan(0);
    });

    it('should have Slack actions', () => {
      const slackActions = MockActions.filter(a => String(a.serviceId) === '6');
      expect(slackActions.length).toBeGreaterThan(0);
    });

    it('should have Spotify actions', () => {
      const spotifyActions = MockActions.filter(a => String(a.serviceId) === '4');
      expect(spotifyActions.length).toBeGreaterThan(0);
    });

    it('should have Jira actions', () => {
      const jiraActions = MockActions.filter(a => String(a.serviceId) === '5');
      expect(jiraActions.length).toBeGreaterThan(0);
    });

    it('should have action descriptions', () => {
      MockActions.forEach(action => {
        expect(action).toHaveProperty('name');
        expect(action).toHaveProperty('description');
        expect(typeof action.name).toBe('string');
        expect(typeof action.description).toBe('string');
      });
    });

    it('should have Create Pull Request action for GitHub', () => {
      const prAction = MockActions.find(a => a.name === 'Create Pull Request');
      expect(prAction).toBeDefined();
      expect(String(prAction?.serviceId)).toBe('1');
    });

    it('should have Send Message action for Slack', () => {
      const sendMsgAction = MockActions.find(a => a.name === 'Send Message');
      expect(sendMsgAction).toBeDefined();
      expect(String(sendMsgAction?.serviceId)).toBe('6');
    });

    it('should have Create Playlist action for Spotify', () => {
      const playlistAction = MockActions.find(a => a.name === 'Create Playlist');
      expect(playlistAction).toBeDefined();
      expect(String(playlistAction?.serviceId)).toBe('4');
    });
  });

  describe('mock data consistency', () => {
    it('all area services should reference valid services', () => {
      mockData.forEach(area => {
        if (area.services && Array.isArray(area.services)) {
          area.services.forEach(serviceId => {
            const service = mockServices.find(s => s.id === serviceId);
            expect(service).toBeDefined();
          });
        }
      });
    });

    it('all actions should reference valid services', () => {
      MockActions.forEach(action => {
        const service = mockServices.find(s => String(s.id) === String(action.serviceId));
        expect(service).toBeDefined();
      });
    });
  });
});
