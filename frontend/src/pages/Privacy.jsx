import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link to="/login" className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white">
          <ArrowLeft size={18} />
          Back
        </Link>

        <div className="rounded-2xl border border-white/10 bg-[#161B26] p-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="mb-8 text-sm text-slate-400">Last updated: May 10, 2026</p>

          <div className="space-y-8 text-slate-300">
            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">1. Introduction</h2>
              <p>
                TeamFlow ("we", "us", "our", or "Company") operates the Team Task Manager application. This page informs
                you of our policies regarding the collection, use, and disclosure of personal data when you use our
                service and the choices you have associated with that data.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">2. Information Collection and Use</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-medium text-white">Personal Data</h3>
                  <p className="text-sm">
                    We collect the following personal information when you create an account:
                  </p>
                  <ul className="mt-2 list-inside space-y-1 text-sm">
                    <li>• Full Name</li>
                    <li>• Email Address</li>
                    <li>• Password (encrypted and securely hashed)</li>
                    <li>• User Role (Admin or Member)</li>
                    <li>• Account creation timestamp</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-medium text-white">Usage Data</h3>
                  <p className="text-sm">
                    We may also collect information about how you access and use the service, including:
                  </p>
                  <ul className="mt-2 list-inside space-y-1 text-sm">
                    <li>• Projects you create and join</li>
                    <li>• Tasks you create and update</li>
                    <li>• Subtasks and comments you add</li>
                    <li>• Login timestamps and activity logs</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">3. Use of Data</h2>
              <p>
                TeamFlow uses the collected data for various purposes:
              </p>
              <ul className="mt-4 list-inside space-y-2 text-sm">
                <li>• To provide and maintain the service</li>
                <li>• To authenticate and authorize users</li>
                <li>• To store and manage your projects and tasks</li>
                <li>• To support collaboration between team members</li>
                <li>• To notify you about changes to the service</li>
                <li>• To provide customer support and respond to inquiries</li>
                <li>• To monitor and analyze trends and usage for service improvement</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">4. Security of Data</h2>
              <p>
                The security of your data is important to us but remember that no method of transmission over the
                Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable
                means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <p>Security measures we employ:</p>
                <ul className="list-inside space-y-1">
                  <li>• Password hashing with bcryptjs</li>
                  <li>• JWT-based authentication</li>
                  <li>• HTTPS/TLS encryption in transit (when deployed)</li>
                  <li>• Role-based access control (RBAC)</li>
                  <li>• Database-level encryption (when using PostgreSQL)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">5. Data Retention</h2>
              <p>
                TeamFlow will retain your Personal Data only for as long as necessary for the purposes set out in this
                Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our
                legal obligations.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">6. Your Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal data:
              </p>
              <ul className="mt-4 list-inside space-y-2 text-sm">
                <li>• Right to access your personal data</li>
                <li>• Right to correct or update your personal data</li>
                <li>• Right to request deletion of your account and associated data</li>
                <li>• Right to data portability</li>
                <li>• Right to object to processing of your data</li>
              </ul>
              <p className="mt-4 text-sm">
                To exercise any of these rights, please contact us using the information provided below.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">7. Third-Party Links</h2>
              <p>
                Our service may contain links to other sites that are not operated by us. If you click on a third-party
                link, you will be directed to that third party's site. We strongly advise you to review the privacy
                policy of every site you visit. We have no control over and assume no responsibility for the content,
                privacy policies, or practices of any third-party sites or services.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">8. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 space-y-1 text-sm">
                <p>Email: privacy@teamflow.com</p>
                <p>Address: TeamFlow HQ, Tech Building, Innovation Street</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
