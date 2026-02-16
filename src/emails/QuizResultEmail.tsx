import * as React from "react";

export interface QuizResultEmailProps {
  name: string;
  score: number;
  category: "The Manualist" | "The Hybrid Optimizer" | "The Automation Architect";
  categoryDescription: string;
  toolkitLink: string;
}

const getCategoryAdvice = (
  category: QuizResultEmailProps["category"]
): React.ReactNode => {
  const bulletStyle = {
    margin: "10px 0",
    color: "rgba(255,255,255,0.8)",
    lineHeight: "1.8",
    fontSize: "15px",
  };

  const strongStyle = {
    color: "#00ccff",
  };

  const advice = {
    "The Manualist": (
      <>
        <p style={bulletStyle}>
          <strong style={strongStyle}>Start small:</strong> Pick one repetitive task and
          automate it this week
        </p>
        <p style={bulletStyle}>
          <strong style={strongStyle}>AI-powered tools:</strong> Try ChatGPT or Claude for
          content creation
        </p>
        <p style={bulletStyle}>
          <strong style={strongStyle}>Low-hanging fruit:</strong> Email scheduling, social media
          automation, basic reporting
        </p>
      </>
    ),
    "The Hybrid Optimizer": (
      <>
        <p style={bulletStyle}>
          <strong style={strongStyle}>Connect your tools:</strong> Use Zapier or Make to
          integrate your existing platforms
        </p>
        <p style={bulletStyle}>
          <strong style={strongStyle}>AI enhancement:</strong> Layer AI on top of your current
          automation for smarter workflows
        </p>
        <p style={bulletStyle}>
          <strong style={strongStyle}>Advanced features:</strong> Explore AI-powered analytics
          and predictive insights
        </p>
      </>
    ),
    "The Automation Architect": (
      <>
        <p style={bulletStyle}>
          <strong style={strongStyle}>Scale your systems:</strong> Build custom AI agents for
          complex workflows
        </p>
        <p style={bulletStyle}>
          <strong style={strongStyle}>Data intelligence:</strong> Implement ML models for
          predictive automation
        </p>
        <p style={bulletStyle}>
          <strong style={strongStyle}>Share your knowledge:</strong> Mentor others and document
          your automation playbooks
        </p>
      </>
    ),
  };

  return advice[category];
};

export const QuizResultEmail = ({
  name,
  score,
  category,
  categoryDescription,
  toolkitLink,
}: QuizResultEmailProps) => (
  <div
    style={{
      fontFamily:
        "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      backgroundColor: "#0a0a0a",
      color: "#ffffff",
      padding: "0",
      margin: "0",
    }}
  >
    <table
      cellPadding={0}
      cellSpacing={0}
      style={{
        width: "100%",
        borderCollapse: "collapse",
      }}
    >
      <tr>
        <td
          style={{
            padding: "40px 20px",
            textAlign: "center" as const,
          }}
        >
          <table
            cellPadding={0}
            cellSpacing={0}
            style={{
              maxWidth: "600px",
              width: "100%",
              margin: "0 auto",
              borderCollapse: "collapse",
            }}
          >
            <tr>
              <td
                style={{
                  background: "linear-gradient(135deg, #0066ff 0%, #00ccff 100%)",
                  padding: "40px 30px",
                  textAlign: "center" as const,
                  borderRadius: "12px 12px 0 0",
                }}
              >
                <div style={{ marginBottom: "20px" }}>
                   <img 
                    src="/assets/luna.png" 
                    alt="Luna" 
                    style={{ maxWidth: '120px' }} 
                    />
                </div>

                <h1
                  style={{
                    margin: "0",
                    color: "#ffffff",
                    fontSize: "28px",
                    fontWeight: "700",
                  }}
                >
                  Hey {name}! 👋
                </h1>
                <p
                  style={{
                    margin: "10px 0 0 0",
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "16px",
                  }}
                >
                  Luna here with your AI Readiness Results
                </p>
              </td>
            </tr>

            <tr>
              <td
                style={{
                  backgroundColor: "#1a1a1a",
                  padding: "40px 30px",
                  borderRadius: "0 0 12px 12px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#252525",
                    borderLeft: "4px solid #0066ff",
                    padding: "20px",
                    marginBottom: "30px",
                    borderRadius: "8px",
                  }}
                >
                  <h2
                    style={{
                      margin: "0 0 10px 0",
                      color: "#00ccff",
                      fontSize: "24px",
                      fontWeight: "700",
                    }}
                  >
                    Your Score: {score}/24
                  </h2>
                  <h3
                    style={{
                      margin: "0 0 15px 0",
                      color: "#ffffff",
                      fontSize: "20px",
                      fontWeight: "700",
                    }}
                  >
                    You're {category}
                  </h3>
                  <p
                    style={{
                      margin: "0",
                      color: "rgba(255,255,255,0.8)",
                      lineHeight: "1.6",
                      fontSize: "15px",
                    }}
                  >
                    {categoryDescription}
                  </p>
                </div>

                <div style={{ marginBottom: "30px" }}>
                  <p
                    style={{
                      margin: "0 0 15px 0",
                      color: "rgba(255,255,255,0.9)",
                      lineHeight: "1.6",
                      fontSize: "15px",
                    }}
                  >
                    Based on your results, I've put together some insights on how you can
                    level up your automation game:
                  </p>

                  <div style={{ marginTop: "20px" }}>{getCategoryAdvice(category)}</div>
                </div>

                <div style={{ textAlign: "center" as const, margin: "40px 0" }}>
                  <a
                    href={toolkitLink}
                    style={{
                      display: "inline-block",
                      background: "linear-gradient(135deg, #0066ff 0%, #00ccff 100%)",
                      color: "#ffffff",
                      textDecoration: "none",
                      padding: "16px 40px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "16px",
                    }}
                  >
                    Download Your AI Marketing Toolkit 🎁
                  </a>
                </div>

                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid #333333",
                    margin: "30px 0",
                  }}
                />

                <p
                  style={{
                    margin: "0",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  Questions? Just reply to this email - I'm always here to help!
                  <br />
                  <br />
                  — Luna
                  <img 
                    src="/assets/luna.png" 
                    alt="Luna Icon" 
                    style={{ width: '56px'}} 
                    />
                  <br />
                  <span style={{ color: "#0066ff" }}>Your AI Assistant at Lunim</span>
                </p>
              </td>
            </tr>

            <tr>
              <td
                style={{
                  textAlign: "center" as const,
                  padding: "20px",
                }}
              >
                <p
                  style={{
                    margin: "0",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "12px",
                  }}
                >
                  © {new Date().getFullYear()} Lunim. All rights reserved.
                  <br />
                  <a
                    href="https://lunim.io"
                    style={{
                      color: "#0066ff",
                      textDecoration: "none",
                    }}
                  >
                    Visit Lunim.io
                  </a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
);

QuizResultEmail.displayName = "QuizResultEmail";