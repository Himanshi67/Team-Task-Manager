import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link to="/login" className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white">
          <ArrowLeft size={18} />
          Back
        </Link>

        <div className="rounded-2xl border border-white/10 bg-[#161B26] p-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Terms of Service</h1>
          <p className="mb-8 text-sm text-slate-400">Last updated: May 10, 2026</p>

          <div className="space-y-8 text-slate-300">
            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the Team Task Manager ("Service"), you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to abide by the above, please do not use this
                service.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on
                TeamFlow's Service for personal, non-commercial transitory viewing only. This is the grant of a license,
                not a transfer of title, and under this license you may not:
              </p>
              <ul className="mt-4 list-inside space-y-2 text-sm">
                <li>• Modifying or copying the materials</li>
                <li>• Using the materials for any commercial purpose or for any public display</li>
                <li>• Attempting to decompile or reverse engineer any software contained on the Service</li>
                <li>• Removing any copyright or other proprietary notations from the materials</li>
                <li>• Transferring the materials to another person or "mirroring" the materials on any other server</li>
                <li>• Using the materials for any illegal or unauthorized purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">3. User Accounts</h2>
              <div className="space-y-4 text-sm">
                <p>
                  When you create an account with TeamFlow, you must provide information that is accurate, complete, and
                  current at all times. Failure to do so constitutes a breach of the Terms, which may result in
                  immediate termination of your account.
                </p>
                <p>
                  You are responsible for safeguarding the password that you use to access the Service and for all
                  activities that occur under your account. You must notify us immediately of any unauthorized use of
                  your account.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">4. User Content</h2>
              <p>
                You grant TeamFlow a non-exclusive, royalty-free, worldwide, perpetual license to use any content,
                including projects, tasks, comments, and files, that you upload or create on the Service. You represent
                and warrant that you own or have the necessary rights to the content you submit.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">5. Role-Based Permissions</h2>
              <div className="space-y-4 text-sm">
                <p>TeamFlow operates with two primary user roles:</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <h3 className="font-medium text-white">Admin</h3>
                    <p className="mt-1 text-slate-400">
                      Admins can create projects, invite members, manage tasks, and delete comments. You agree to use
                      Admin permissions responsibly and ethically.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Member</h3>
                    <p className="mt-1 text-slate-400">
                      Members can view assigned projects, update assigned tasks, and participate in team collaboration.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">6. Acceptable Use Policy</h2>
              <p>
                You agree not to use the Service for any of the following purposes:
              </p>
              <ul className="mt-4 list-inside space-y-2 text-sm">
                <li>• Harassing, abusing, threatening, or defaming other users</li>
                <li>• Uploading or transmitting viruses or malicious code</li>
                <li>• Attempting to access other users' accounts without permission</li>
                <li>• Interfering with the normal operation of the Service</li>
                <li>• Spamming or sending unsolicited communications</li>
                <li>• Violating any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">7. Disclaimer of Warranties</h2>
              <p>
                The materials on TeamFlow's Service are provided on an 'as is' basis. TeamFlow makes no warranties,
                expressed or implied, and hereby disclaims and negates all other warranties including, without limitation,
                implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement
                of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">8. Limitations of Liability</h2>
              <p>
                In no event shall TeamFlow or its suppliers be liable for any damages (including, without limitation,
                damages for loss of data or profit, or due to business interruption) arising out of the use or
                inability to use the materials on TeamFlow's Service, even if TeamFlow or an authorized representative
                has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">9. Accuracy of Materials</h2>
              <p>
                The materials appearing on TeamFlow's Service could include technical, typographical, or photographic
                errors. TeamFlow does not warrant that any of the materials on its Service are accurate, complete, or
                current. TeamFlow may make changes to the materials contained on its Service at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">10. Links</h2>
              <p>
                TeamFlow has not reviewed all of the sites linked to its website and is not responsible for the contents
                of any such linked site. The inclusion of any link does not imply endorsement by TeamFlow of the site.
                Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">11. Modifications</h2>
              <p>
                TeamFlow may revise these terms of service for its Service at any time without notice. By using this
                Service, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">12. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction
                where TeamFlow operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that
                location.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">13. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 space-y-1 text-sm">
                <p>Email: support@teamflow.com</p>
                <p>Address: TeamFlow HQ, Tech Building, Innovation Street</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
