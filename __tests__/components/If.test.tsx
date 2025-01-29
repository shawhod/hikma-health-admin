import { render } from '@testing-library/react';
import If from '../../components/If';

describe('If component', () => {
  test('renders children when show is true', () => {
    const { getByText } = render(
      <If show={true}>
        <div>Test Content</div>
      </If>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  test('does not render children when show is false', () => {
    const { queryByText } = render(
      <If show={false}>
        <div>Test Content</div>
      </If>
    );

    expect(queryByText('Test Content')).not.toBeInTheDocument();
  });

  test('handles multiple children when show is true', () => {
    const { getByText } = render(
      <If show={true}>
        <div>First Child</div>
        <div>Second Child</div>
      </If>
    );

    expect(getByText('First Child')).toBeInTheDocument();
    expect(getByText('Second Child')).toBeInTheDocument();
  });

  test('handles non-element children when show is true', () => {
    const { getByText, queryByText } = render(
      <If show={true}>
        <div test-id="if-test">
          <span>Span Node</span>
          {42}
          {true}
        </div>
      </If>
    );

    expect(queryByText(42)).toBeInTheDocument();
    expect(getByText('Span Node')).toBeInTheDocument();
    expect(queryByText('true')).not.toBeInTheDocument();
  });
});
