import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSync, FaDownload } from 'react-icons/fa';
import ErrorChecker from '../lib/errorChecker';
import AdminLayout from '../components/AdminLayout';
import toast, { Toaster } from 'react-hot-toast';

export default function SystemDiagnostics() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoFixing, setAutoFixing] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    toast.loading('Running diagnostics...');

    try {
      const checker = new ErrorChecker();
      await checker.runAllChecks();
      const reportData = checker.getReport();
      setReport(reportData);
      
      toast.dismiss();
      if (reportData.summary.totalErrors === 0) {
        toast.success('All checks passed! ✅');
      } else {
        toast.error(`Found ${reportData.summary.totalErrors} errors`);
      }
    } catch (error) {
      console.error('Diagnostics error:', error);
      toast.dismiss();
      toast.error('Diagnostics failed');
    } finally {
      setLoading(false);
    }
  };

  const runAutoFix = async () => {
    setAutoFixing(true);
    toast.loading('Running auto-fix...');

    try {
      const checker = new ErrorChecker();
      await checker.runAllFixes();
      const fixReport = checker.getReport();
      
      toast.dismiss();
      toast.success(`Applied ${fixReport.summary.totalFixes} fixes`);
      
      // Re-run diagnostics
      runDiagnostics();
    } catch (error) {
      console.error('Auto-fix error:', error);
      toast.dismiss();
      toast.error('Auto-fix failed');
    } finally {
      setAutoFixing(false);
    }
  };

  const downloadReport = () => {
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-report-${new Date().toISOString()}.json`;
    link.click();
    toast.success('Report downloaded');
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <AdminLayout>
      <Toaster position="top-center" />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            🔧 System Diagnostics
          </h1>
          <p className="text-gray-300">Automated error checking and fixing</p>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runDiagnostics}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            {loading ? 'Running...' : 'Run Diagnostics'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runAutoFix}
            disabled={autoFixing || !report}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2"
          >
            <FaSync className={autoFixing ? 'animate-spin' : ''} />
            {autoFixing ? 'Fixing...' : 'Auto-Fix Issues'}
          </motion.button>

          {report && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadReport}
              className="btn-secondary flex items-center gap-2"
            >
              <FaDownload />
              Download Report
            </motion.button>
          )}
        </div>

        {/* Summary Cards */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`glass-effect p-6 rounded-xl ${
                report.summary.totalErrors === 0 ? 'border-green-500' : 'border-red-500'
              } border-2`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-xl">Errors</h3>
                {report.summary.totalErrors === 0 ? (
                  <FaCheckCircle className="text-green-500 text-3xl" />
                ) : (
                  <FaTimesCircle className="text-red-500 text-3xl" />
                )}
              </div>
              <p className="text-4xl font-bold text-white">
                {report.summary.totalErrors}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-effect p-6 rounded-xl border-2 border-yellow-500"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-xl">Warnings</h3>
                <FaExclamationTriangle className="text-yellow-500 text-3xl" />
              </div>
              <p className="text-4xl font-bold text-white">
                {report.summary.totalWarnings}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-effect p-6 rounded-xl border-2 border-blue-500"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-xl">Fixes Applied</h3>
                <FaCheckCircle className="text-blue-500 text-3xl" />
              </div>
              <p className="text-4xl font-bold text-white">
                {report.summary.totalFixes}
              </p>
            </motion.div>
          </div>
        )}

        {/* Errors List */}
        {report && report.errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect p-6 rounded-xl mb-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaTimesCircle className="text-red-500" />
              Errors ({report.errors.length})
            </h2>
            <div className="space-y-3">
              {report.errors.map((error, index) => (
                <div key={index} className="alert-error">
                  <p className="font-semibold">{error.message}</p>
                  {error.details && (
                    <p className="text-sm mt-1 opacity-80">{error.details}</p>
                  )}
                  <p className="text-xs mt-2 opacity-60">
                    {new Date(error.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Warnings List */}
        {report && report.warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-effect p-6 rounded-xl mb-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaExclamationTriangle className="text-yellow-500" />
              Warnings ({report.warnings.length})
            </h2>
            <div className="space-y-3">
              {report.warnings.map((warning, index) => (
                <div key={index} className="alert-warning">
                  <p className="font-semibold">{warning.message}</p>
                  {warning.details && (
                    <p className="text-sm mt-1 opacity-80">{warning.details}</p>
                  )}
                  <p className="text-xs mt-2 opacity-60">
                    {new Date(warning.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Fixes List */}
        {report && report.fixes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect p-6 rounded-xl"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              Applied Fixes ({report.fixes.length})
            </h2>
            <div className="space-y-3">
              {report.fixes.map((fix, index) => (
                <div key={index} className="alert-success">
                  <p className="font-semibold">{fix.message}</p>
                  <p className="text-xs mt-2 opacity-60">
                    {new Date(fix.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Clear Message */}
        {report && report.summary.totalErrors === 0 && report.summary.totalWarnings === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">
              All Systems Operational! 🎉
            </h2>
            <p className="text-gray-300">
              No errors or warnings detected. Your LMS is running smoothly.
            </p>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
