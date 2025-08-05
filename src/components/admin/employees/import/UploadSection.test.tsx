import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UploadSection } from './UploadSection';

describe('UploadSection', () => {
  it('renders consistently', () => {
    const { container } = render(
      <UploadSection
        uploadMethod={null}
        setUploadMethod={() => {}}
        uploadedFile={null}
        manualEmployees={[]}
        csvText=""
        setCsvText={() => {}}
        onFileUpload={() => {}}
        onPasteData={() => {}}
        onManualAdd={() => {}}
        onChangeFile={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
  });
});

