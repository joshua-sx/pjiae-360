import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UploadSection } from './UploadSection';

describe('UploadSection', () => {
  it('renders without paste CSV component', () => {
    const { queryByText } = render(
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
    expect(queryByText(/Paste CSV Data/i)).toBeNull();
  });
});

