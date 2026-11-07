export interface Service {
  id: string;
  key: string;
  name: string;
  auth: 'OAUTH2' | 'APIKEY';
  docsUrl: string;
  iconLightUrl: string;
  iconDarkUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
