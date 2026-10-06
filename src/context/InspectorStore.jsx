// Re-export from ComplianceStore for backwards compatibility.
// All multi-role data is managed in ComplianceStore.jsx.
export {
  ComplianceStoreProvider as InspectorStoreProvider,
  useComplianceStore as useInspectorStore,
} from './ComplianceStore.jsx';
