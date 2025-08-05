import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MappingSection } from './MappingSection';

describe('MappingSection', () => {
  it('renders consistently', () => {
    const { container } = render(
      <MappingSection
        uploadMethod="upload"
        headers={[]}
        rows={[]}
        columnMapping={{}}
        uploadedFile={null}
        onComplete={() => {}}
        onBack={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
  });
});

