import { AccountCardProps } from '../types';

export const mockAccounts: Omit<AccountCardProps, 'onView' | 'onChange' | 'onDelete' | 'onConnect'>[] = [
  {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png',
    accountName: 'Slack Account',
    email: 'user@slack.com',
    isLoggedIn: true,
  },
  {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png',
    accountName: 'Gmail Account',
    email: 'user@gmail.com',
    isLoggedIn: true,
  },
  {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/GitHub_logo_2013.svg',
    accountName: 'GitHub Account',
    email: 'user@github.com',
    isLoggedIn: false,
  },
];