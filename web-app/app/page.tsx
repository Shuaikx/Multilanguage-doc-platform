import { DocumentWorkbench } from './document-workbench';
import { getDocuments } from '@/lib/documents';

export default function Home() {
  return <DocumentWorkbench documents={getDocuments()} />;
}
