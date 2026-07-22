function PrivacySection({ number, title, children }) {
  return (
    <section className="mt-[55px]">
      <h2 className="mb-[30px] text-[22px] font-medium leading-[1.4] text-[#111] md:text-[28px]">
        <span>{number}. </span>
        {title}
      </h2>

      <div className="text-[15px] font-normal leading-[1.9] text-[#222] md:text-[17px] md:leading-[2]">
        {children}
      </div>
    </section>
  );
}

function PrivacyList({ children }) {
  return (
    <ul className="my-[18px] list-disc space-y-[18px] pl-7 marker:text-[#111]">
      {children}
    </ul>
  );
}

function PrivacyPolicy() {
  return (
    <main className="bg-white text-[#111]">
      <article className="mx-auto max-w-[1350px] px-5 pb-20 pt-10 sm:px-8 md:px-10 md:pb-[120px] md:pt-[60px]">
        <header>
          <h1 className="mb-16 text-center text-[30px] font-normal uppercase leading-[1.35] tracking-[0.18em] text-[#111] md:mb-20 md:text-[44px] md:tracking-[0.28em]">
            Privacy Policy
          </h1>
        </header>

        {/* 1. Data Security */}
        <PrivacySection number="1" title="Data Security">
          <PrivacyList>
            <li>
              <span className="font-medium">Definition of Personal Data:</span>{" "}
              Under applicable data protection regulations, personal data refers
              to information relating to an identifiable individual, such as
              name, contact details, shipping information, payment details, or
              any identifiers that can directly or indirectly identify a person.
            </li>

            <li>
              <span className="font-medium">Data Protection Commitment:</span>{" "}
              TeeLab is committed to protecting customer information from
              unauthorized access, misuse, disclosure, or alteration. We
              implement appropriate technical and organizational measures to
              safeguard your personal data.
            </li>

            <li>
              <span className="font-medium">Scope of Data Security:</span> Our
              Data Security Policy applies to all customer and personal
              information processed by TeeLab, including information stored
              within our databases, servers, systems, and any trusted
              third-party services used to operate our business.
            </li>

            <li>
              <span className="font-medium">Access Control:</span> Access to
              customer information is limited to authorized employees and
              trusted service providers only when necessary to process orders,
              provide customer support, or maintain our services.
            </li>

            <li>
              <span className="font-medium">User Accountability:</span> Every
              authorized user accessing sensitive information is responsible for
              maintaining confidentiality, and all access activities may be
              monitored to ensure accountability.
            </li>

            <li>
              <span className="font-medium">User Logs:</span> Access records may
              be maintained to investigate security incidents, prevent fraud,
              and improve system security.
            </li>

            <li>
              <span className="font-medium">
                Third-Party Service Providers:
              </span>{" "}
              TeeLab works only with trusted third-party providers that help us
              process orders, payments, shipping, analytics, and customer
              support. These providers are required to protect customer
              information and may only use it for the services they provide to
              TeeLab.
            </li>

            <li>
              <span className="font-medium">Payment Information:</span> TeeLab
              does not store, sell, rent, or share customers&apos; credit or
              debit card information beyond what is required to securely process
              transactions through trusted payment providers.
            </li>
          </PrivacyList>
        </PrivacySection>

        {/* 2. Disclaimer */}
        <PrivacySection number="2" title="Disclaimer">
          <PrivacyList>
            <li>
              <span className="font-medium">Intellectual Property:</span> All
              intellectual property associated with TeeLab, including product
              designs, graphics, logos, images, website content, and branding,
              is owned or licensed by TeeLab. All rights are reserved.
            </li>

            <li>
              <span className="font-medium">Content Usage:</span> All content
              available on the TeeLab website is protected by copyright and may
              not be copied, reproduced, distributed, or used without prior
              written permission.
            </li>

            <li>
              <span className="font-medium">Policy Updates:</span> TeeLab may
              update this Privacy Policy from time to time to reflect changes in
              legal requirements or business operations. Updated versions will
              be published on this page.
            </li>
          </PrivacyList>
        </PrivacySection>

        {/* 3. Cookie Preferences */}
        <PrivacySection number="3" title="Cookie Preferences">
          <PrivacyList>
            <li>
              TeeLab uses cookies to improve your browsing experience, remember
              your preferences, and enhance website performance. You may disable
              cookies through your browser settings at any time; however, doing
              so may affect certain website features and functionality.
            </li>
          </PrivacyList>
        </PrivacySection>

        {/* 4. Data Privacy Policy */}
        <PrivacySection number="4" title="Data Privacy Policy">
          <PrivacyList>
            <li>
              You may opt out of receiving promotional emails or marketing
              communications at any time. If you wish to close your TeeLab
              account or request deletion of your personal information, please
              contact our support team. Subject to applicable legal obligations,
              we will process your request and securely remove your personal
              data from our systems.
            </li>
          </PrivacyList>
        </PrivacySection>
      </article>
    </main>
  );
}

export default PrivacyPolicy;
