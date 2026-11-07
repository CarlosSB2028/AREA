import { render } from '@testing-library/react-native';
import React from 'react';
import { GithubIcon, GoogleIcon, MicrosoftIcon } from '../icons';

describe('OAuth Icons', () => {
  describe('GithubIcon', () => {
    it('renders correctly with default props', () => {
      const { toJSON } = render(<GithubIcon />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom size', () => {
      const { toJSON } = render(<GithubIcon size={30} />);
      expect(toJSON()).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders with custom color', () => {
      const { toJSON } = render(<GithubIcon color="#000000" />);
      expect(toJSON()).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders with both custom size and color', () => {
      const { toJSON } = render(<GithubIcon size={40} color="#FF0000" />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('GoogleIcon', () => {
    it('renders correctly with default props', () => {
      const { toJSON } = render(<GoogleIcon />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom size', () => {
      const { toJSON } = render(<GoogleIcon size={30} />);
      expect(toJSON()).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders with large size', () => {
      const { toJSON } = render(<GoogleIcon size={50} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with small size', () => {
      const { toJSON } = render(<GoogleIcon size={16} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('MicrosoftIcon', () => {
    it('renders correctly with default props', () => {
      const { toJSON } = render(<MicrosoftIcon />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom size', () => {
      const { toJSON } = render(<MicrosoftIcon size={30} />);
      expect(toJSON()).toBeTruthy();
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders with large size', () => {
      const { toJSON } = render(<MicrosoftIcon size={48} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with small size', () => {
      const { toJSON } = render(<MicrosoftIcon size={12} />);
      expect(toJSON()).toBeTruthy();
    });

    it('matches snapshot', () => {
      const { toJSON } = render(<MicrosoftIcon />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('All Icons Together', () => {
    it('renders all icons with same size', () => {
      const size = 24;
      const github = render(<GithubIcon size={size} />);
      const google = render(<GoogleIcon size={size} />);
      const microsoft = render(<MicrosoftIcon size={size} />);

      expect(github.toJSON()).toBeTruthy();
      expect(google.toJSON()).toBeTruthy();
      expect(microsoft.toJSON()).toBeTruthy();
    });
  });
});
