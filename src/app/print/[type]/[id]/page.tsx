import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AutoPrint } from "./AutoPrint";

export default async function PrintReceiptPage({ params }: { params: Promise<{ type: string, id: string }> }) {
  const { type, id } = await params;

  let requestData = null;

  if (type === 'studio') {
    requestData = await prisma.studioBooking.findUnique({
      where: { id },
      include: { requester: true, approver: true }
    });
  } else if (type === 'marketing') {
    requestData = await prisma.marketingJob.findUnique({
      where: { id },
      include: { requester: true, approver: true }
    });
  }

  if (!requestData) {
    notFound();
  }

  // Common Header Formatting
  const printDate = new Date().toLocaleDateString();

  return (
    <div className="bg-white text-black min-h-screen p-8 max-w-4xl mx-auto font-sans print:p-0 print:m-0">
      
      <AutoPrint />

      <div className="border border-slate-300 p-10 rounded-sm">
        
        {/* Header Ribbon */}
        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">OMP {type === 'studio' ? 'Studio' : 'Marketing'} Request</h1>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">Official Document Receipt</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold bg-slate-100 px-3 py-1 rounded">ID: {id.slice(-8).toUpperCase()}</div>
            <div className="text-sm text-slate-500 mt-2">Generated: {printDate}</div>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="mb-10 flex gap-12">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                <div className="text-xl font-bold uppercase">{requestData.status.replace('_', ' ')}</div>
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Creation Date</p>
                <div className="text-lg font-medium">{requestData.createdAt.toLocaleDateString()}</div>
            </div>
        </div>

        {/* Dynamic Detailed Info Table */}
        <div className="mb-10 outline outline-1 outline-slate-200">
            <table className="w-full text-left">
                <tbody>
                    {/* Common Requester Row */}
                    <tr className="border-b border-slate-200">
                        <th className="py-3 px-4 bg-slate-50 w-1/3 text-sm uppercase tracking-wider font-bold">Requester</th>
                        <td className="py-3 px-4 font-medium">{requestData.requester.name} ({requestData.requester.email})</td>
                    </tr>

                    {/* Studio Type Specific */}
                    {type === 'studio' && 'progName' in requestData && (
                        <>
                            <tr className="border-b border-slate-200">
                                <th className="py-3 px-4 bg-slate-50 w-1/3 text-sm uppercase tracking-wider font-bold">Program Name</th>
                                <td className="py-3 px-4 font-medium">{requestData.progName}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <th className="py-3 px-4 bg-slate-50 w-1/3 text-sm uppercase tracking-wider font-bold">Mode</th>
                                <td className="py-3 px-4 font-medium">{requestData.mode}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <th className="py-3 px-4 bg-slate-50 w-1/3 text-sm uppercase tracking-wider font-bold">Recording Date</th>
                                <td className="py-3 px-4 font-medium">{requestData.dateOfRecording.toLocaleDateString()}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <th className="py-3 px-4 bg-slate-50 w-1/3 text-sm uppercase tracking-wider font-bold">Time Window</th>
                                <td className="py-3 px-4 font-medium">{requestData.timeOfRecording}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <th className="py-3 px-4 bg-slate-50 w-1/3 text-sm uppercase tracking-wider font-bold">Producer & Presenter</th>
                                <td className="py-3 px-4 font-medium">{requestData.producer} / {requestData.presenter}</td>
                            </tr>
                        </>
                    )}

                    {/* Marketing Type Specific */}
                    {type === 'marketing' && 'location' in requestData && (
                        <>
                            <tr className="border-b border-slate-200">
                                <th className="py-3 px-4 bg-slate-50 w-1/3 text-sm uppercase tracking-wider font-bold">Location</th>
                                <td className="py-3 px-4 font-medium">{requestData.location}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <th className="py-3 px-4 bg-slate-50 w-1/3 text-sm uppercase tracking-wider font-bold">Assignment Schedule</th>
                                <td className="py-3 px-4 font-medium">{requestData.dateOfAssignment.toLocaleDateString()} at {requestData.timeOfAssignment}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <th className="py-3 px-4 bg-slate-50 w-1/3 text-sm uppercase tracking-wider font-bold align-top">Job Description</th>
                                <td className="py-3 px-4 font-medium whitespace-pre-wrap">{requestData.jobDescription}</td>
                            </tr>
                        </>
                    )}
                </tbody>
            </table>
        </div>

        {/* Approval Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-16 pt-10 border-t border-slate-200">
            <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-8">Head of Unit Signature</p>
                <div className="border-b border-black w-full mb-2"></div>
                <p className="text-xs text-slate-500 italic">Sign and Date</p>
            </div>
            <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-8">Engineering Manager Signature</p>
                <div className="border-b border-black w-full mb-2"></div>
                <p className="text-xs text-slate-500 italic">Sign and Date {requestData.approver ? `(Electronically Approved by ${requestData.approver.name})` : ''}</p>
            </div>
        </div>

      </div>
    </div>
  );
}
