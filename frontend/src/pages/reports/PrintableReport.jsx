import React from 'react';
import { SchoolLogo } from '../../components/common/SchoolLogo';
import { Button } from '../../components/common/Button';
import { Printer, ArrowLeft } from 'lucide-react';

export const PrintableReport = ({
  title,
  subtitle,
  metadata = {},
  onBack,
  children
}) => {
  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack} icon={<ArrowLeft size={16} />}>
              Back to Reports
            </Button>
          )}
          <span className="text-xs font-semibold text-slate-600">Print Preview Mode</span>
        </div>
        <Button variant="primary" onClick={() => window.print()} icon={<Printer size={16} />}>
          Print / Save PDF
        </Button>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm printable-document">
        <div className="border-b-2 border-primary pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SchoolLogo size={56} showText={false} />
            <div>
              <h1 className="text-xl font-bold text-primary tracking-wide">
                ST. MARTIN'S MATRICULATION HR.SEC. SCHOOL
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Student Behaviour &amp; Discipline Monitoring System
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div className="font-semibold text-slate-700">Official School Document</div>
            <div>Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {Object.keys(metadata).length > 0 && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
              {Object.entries(metadata).map(([key, val]) => (
                <div key={key}>
                  <span className="font-semibold text-slate-600">{key}: </span>
                  <span className="text-slate-800">{val || 'All'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="report-body text-sm">
          {children}
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-3 gap-8 text-center text-xs text-slate-600">
          <div><div className="border-t border-slate-400 pt-2 font-medium">Class Teacher</div></div>
          <div><div className="border-t border-slate-400 pt-2 font-medium">Discipline Committee</div></div>
          <div><div className="border-t border-slate-400 pt-2 font-medium">Principal</div></div>
        </div>
      </div>
    </div>
  );
};
