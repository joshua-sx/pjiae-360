import { render } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import { ReviewSection } from './ReviewSection';
import { EmployeeData } from './types';

describe('ReviewSection', () => {
  beforeAll(() => {
    // jsdom doesn't implement ResizeObserver which is used by DataTable
    (global as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });
  it('renders consistently', () => {
    const employees: EmployeeData[] = [];
    const { container } = render(
      <ReviewSection
        employees={employees}
        columnMapping={{}}
        onBack={() => {}}
        onNext={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
  });
});

