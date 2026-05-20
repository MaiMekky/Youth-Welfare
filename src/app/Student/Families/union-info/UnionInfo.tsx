"use client";
import React from "react";
import { ArrowRight, Users, Award, Calendar, Target, CheckCircle } from "lucide-react";
import "./UnionInfo.css";

interface UnionInfoProps {
  onBack: () => void;
}

const UnionInfo: React.FC<UnionInfoProps> = ({ onBack }) => {
  return (
    <div className="union-page" dir="rtl">
      {/* Header */}
      <div className="union-header-row">
        <button className="union-back-btn" onClick={onBack}>
          <ArrowRight size={18} />
          العودة
        </button>
        <div className="union-title-box">
          <h1 className="union-title">الإتحادات الطلابية</h1>
        </div>
      </div>

      {/* Content */}
      <div className="union-content">
        {/* Introduction Section */}
        <div className="union-section">
          <div className="union-card">
            <div className="union-card-header">
              <Users size={24} />
              <h2>ما هي الإتحادات الطلابية؟</h2>
            </div>
            <p className="union-text">
              تُعد الإتحادات الطلابية من أهم الكيانات الطلابية داخل الجامعة، حيث تمثل حلقة الوصل الرسمية بين الطلاب وإدارة الجامعة، وتهدف إلى التعبير عن آراء الطلاب واحتياجاتهم والعمل على تحسين الحياة الجامعية من خلال الأنشطة والخدمات المختلفة.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="union-section">
          <div className="union-card">
            <div className="union-card-header">
              <Award size={24} />
              <h2>لماذا تنضم للإتحادات الطلابية؟</h2>
            </div>
            <p className="union-text">
              يشارك الطلاب في الإتحادات من أجل تنمية روح القيادة والتعاون والمسؤولية، بالإضافة إلى اكتساب الخبرات وتنمية المهارات الشخصية والاجتماعية.
            </p>
          </div>
        </div>

        {/* Activities Section */}
        <div className="union-section">
          <div className="union-card">
            <div className="union-card-header">
              <Target size={24} />
              <h2>أنشطة الإتحادات الطلابية</h2>
            </div>
            <p className="union-text">
              تقوم الإتحادات الطلابية بتنظيم العديد من الفعاليات والأنشطة في المجالات الثقافية، والعلمية، والرياضية، والفنية، والاجتماعية، كما تسعى إلى دعم الطلاب أكاديميًا واجتماعيًا من خلال مبادرات التكافل الاجتماعي، والمشاركة في حل المشكلات التي تواجه الطلاب داخل الجامعة، والعمل على خلق بيئة جامعية إيجابية تشجع على الإبداع والمشاركة.
            </p>
          </div>
        </div>

        {/* Application Process Section */}
        <div className="union-section">
          <div className="union-card">
            <div className="union-card-header">
              <Calendar size={24} />
              <h2>كيفية التقديم للإتحادات الطلابية</h2>
            </div>
            
            <div className="union-steps">
              <div className="union-step">
                <div className="union-step-number">1</div>
                <div className="union-step-content">
                  <h3>فتح باب الترشح</h3>
                  <p>يتم التقديم للإتحادات الطلابية مع بداية العام الدراسي من خلال فتح باب الترشح للطلاب الراغبين في المشاركة، وفقًا للشروط التي تحددها الجامعة، مثل الالتزام الأكاديمي وحسن السيرة والسلوك والمشاركة الفعالة داخل الكلية.</p>
                </div>
              </div>

              <div className="union-step">
                <div className="union-step-number">2</div>
                <div className="union-step-content">
                  <h3>الدعاية الانتخابية</h3>
                  <p>بعد انتهاء فترة التقديم، تبدأ مرحلة الدعاية الانتخابية التي يعرّف خلالها المرشحون بأنفسهم وبرامجهم وأفكارهم التي تهدف إلى خدمة الطلاب.</p>
                </div>
              </div>

              <div className="union-step">
                <div className="union-step-number">3</div>
                <div className="union-step-content">
                  <h3>الانتخابات الطلابية</h3>
                  <p>تُجرى انتخابات طلابية داخل الكليات بطريقة ديمقراطية وشفافة، حيث يقوم الطلاب باختيار ممثليهم من خلال التصويت، ليتم بعد ذلك تشكيل اتحاد الطلاب واللجان المختلفة التابعة له.</p>
                </div>
              </div>

              <div className="union-step">
                <div className="union-step-number">4</div>
                <div className="union-step-content">
                  <h3>تشكيل اللجان</h3>
                  <p>تشمل اللجان: اللجنة العلمية، والثقافية، والرياضية، والفنية، والاجتماعية، ولجنة الأسر والجوالة والخدمة العامة، بحيث تتولى كل لجنة تنظيم الأنشطة والفعاليات الخاصة بمجالها.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Member Qualities Section */}
        <div className="union-section">
          <div className="union-card">
            <div className="union-card-header">
              <CheckCircle size={24} />
              <h2>صفات عضو اتحاد الطلاب</h2>
            </div>
            
            <div className="union-qualities">
              <div className="union-quality">
                <CheckCircle size={18} />
                <span>تحمل المسؤولية</span>
              </div>
              <div className="union-quality">
                <CheckCircle size={18} />
                <span>القدرة على التواصل والعمل الجماعي</span>
              </div>
              <div className="union-quality">
                <CheckCircle size={18} />
                <span>حب مساعدة الآخرين</span>
              </div>
              <div className="union-quality">
                <CheckCircle size={18} />
                <span>القدرة على تنظيم الوقت وإدارة الأنشطة</span>
              </div>
              <div className="union-quality">
                <CheckCircle size={18} />
                <span>امتلاك روح المبادرة والقيادة</span>
              </div>
              <div className="union-quality">
                <CheckCircle size={18} />
                <span>السعي الدائم لخدمة زملائه الطلاب</span>
              </div>
            </div>
          </div>
        </div>

        {/* Commitment Section */}
        <div className="union-section">
          <div className="union-card union-card-highlight">
            <div className="union-card-header">
              <Users size={24} />
              <h2>التزام أعضاء الإتحادات</h2>
            </div>
            <p className="union-text">
              يحرص أعضاء الإتحادات الطلابية على التواصل المستمر مع الطلاب للاستماع إلى مقترحاتهم وشكاواهم والعمل على نقلها إلى قيادات الجامعة والمساهمة في إيجاد الحلول المناسبة لها، وذلك في إطار من التعاون والاحترام والثقة المتبادلة، بما يساعد على تطوير الحياة الجامعية وتحقيق أفضل تجربة تعليمية وأنشطة متميزة لجميع الطلاب.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnionInfo;
