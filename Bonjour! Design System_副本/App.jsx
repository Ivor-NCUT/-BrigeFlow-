import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Card, 
  Avatar, 
  Tag, 
  Badge, 
  ListItem, 
  NavBar, 
  TabBar, 
  Grid, 
  CommentItem,
  colors, 
  spacing, 
  typography 
} from './design-system';

const Section = ({ title,children }) => (
  <div style={{ marginBottom: spacing.xl }}>
    <h2 style={{ 
      fontFamily: typography.fontFamily, 
      fontSize: typography.sizes.xl, 
      marginBottom: spacing.md, 
      color: colors.textPrimary,
      borderBottom: `1px solid ${colors.border}`,
      paddingBottom: spacing.sm
    }}>
      {title}
    </h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
      {children}
    </div>
  </div>
);

const ComponentShowcase = () => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div style={{ padding: spacing.lg, maxWidth: '800px', margin: '0 auto' }}>
      <Section title="Typography">
        <Card>
          <h1 style={{ fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold }}>Heading 1</h1>
          <h2 style={{ fontSize: typography.sizes.xl, fontWeight: typography.weights.bold }}>Heading 2</h2>
          <h3 style={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold }}>Heading 3</h3>
          <p style={{ fontSize: typography.sizes.md }}>Body Text (Medium)</p>
          <p style={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>Caption Text (Small)</p>
        </Card>
      </Section>

      <Section title="Colors">
        <Card>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md }}>
            {Object.entries(colors).map(([name, value]) => (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: value, borderRadius: '8px', border: `1px solid ${colors.border}` }} />
                <span style={{ fontSize: typography.sizes.xs, marginTop: spacing.xs, textAlign: 'center' }}>{name}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Buttons">
        <Card>
          <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button size="small">Small</Button>
            <Button size="medium">Medium</Button>
            <Button size="large">Large</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Card>
      </Section>

      <Section title="Inputs">
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <Input placeholder="Text Input..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <Input placeholder="Image Input (Paste/Upload)..." onImageUpload={(file) => console.log(file)} />
          </div>
        </Card>
      </Section>

      <Section title="Avatars & Tags">
        <Card>
          <div style={{ display: 'flex', gap: spacing.xl, alignItems: 'center', marginBottom: spacing.lg }}>
            <Avatar name="Linus Torvalds" size="large" />
            <Avatar name="React" size="medium" />
            <Avatar name="Vue" size="small" />
            <Avatar name="Angular" size="tiny" />
          </div>
          <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
            <Tag label="Design System" color="blue" />
            <Tag label="React" color="green" />
            <Tag label="Featured" color="orange" />
            <Tag label="Bug" color="red" />
            <Badge count={5} />
            <Badge dot />
          </div>
        </Card>
      </Section>

      <Section title="List Items">
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <ListItem 
            avatar={<Avatar name="Alice" />}
            title="Alice"
            subtitle="Hey, are we still on for lunch?"
            rightContent={<span style={{ fontSize: typography.sizes.xs, color: colors.textTertiary }}>10:30 AM</span>}
            onClick={() => {}}
          />
          <ListItem 
            avatar={<Avatar name="Bob" />}
            title="Bob"
            subtitle="Check out this new design system!"
            rightContent={<Badge count={2} />}
            onClick={() => {}}
          />
        </Card>
      </Section>

      <Section title="Comments">
        <Card>
          <CommentItem
            avatar="https://via.placeholder.com/40"
            name="Sarah Parker"
            time="2 hours ago"
            content="This looks amazing! Can't wait to try it out."
            onReply={() => {}}
          >
            <CommentItem
              avatar="https://via.placeholder.com/40"
              name="John Doe"
              time="1 hour ago"
              content="Totally agree! The API seems very intuitive."
              isChild
            />
          </CommentItem>
        </Card>
      </Section>
    </div>
  );
};

const ScreenPreview = () => {
  const [activeTab, setActiveTab] = useState('message');

  const renderScreen = () => {
    switch (activeTab) {
      case 'message':
        return (
          <div style={{ backgroundColor: colors.background, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <NavBar title="Messages" right={<Button variant="ghost" size="small">Edit</Button>} />
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: spacing.md, backgroundColor: colors.backgroundGrouped }}>
                <Card style={{ padding: spacing.sm, display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                  <span style={{ fontSize: '20px' }}>🔔</span>
                  <span style={{ flex: 1, fontSize: typography.sizes.sm }}>Turn on notifications to stay updated</span>
                </Card>
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <ListItem 
                  key={i}
                  avatar={<Avatar name={`User ${i}`} />}
                  title={`User ${i}`}
                  subtitle="Start a conversation with your new friend!"
                  rightContent={<span style={{ fontSize: typography.sizes.xs, color: colors.textTertiary }}>Just now</span>}
                />
              ))}
            </div>
            <TabBar 
              items={[
                { icon: '💬', label: 'Chat', active: true },
                { icon: '👥', label: 'Contacts' },
                { icon: '⚙️', label: 'Settings' },
              ]}
            />
          </div>
        );
      case 'role':
        return (
          <div style={{ backgroundColor: colors.background, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <NavBar title="Select Role" left={<span>Back</span>} />
            <div style={{ padding: spacing.lg, flex: 1, overflowY: 'auto' }}>
              <h2 style={{ fontSize: typography.sizes.xl, marginBottom: spacing.sm }}>Choose your role</h2>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.xl }}>Select the roles that best describe you.</p>
              
              <Grid columns={2} gap={spacing.md}>
                {['Founder', 'Developer', 'Designer', 'Product', 'Investor', 'Other'].map((role) => (
                  <Card key={role} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: spacing.lg, cursor: 'pointer', border: role === 'Developer' ? `2px solid ${colors.primary}` : `1px solid ${colors.border}` }}>
                    <span style={{ fontSize: '32px', marginBottom: spacing.sm }}>👤</span>
                    <span style={{ fontWeight: typography.weights.medium }}>{role}</span>
                  </Card>
                ))}
              </Grid>
            </div>
            <div style={{ padding: spacing.lg, borderTop: `1px solid ${colors.border}` }}>
              <Button size="large" style={{ width: '100%' }}>Continue</Button>
            </div>
          </div>
        );
      case 'post':
        return (
          <div style={{ backgroundColor: colors.background, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <NavBar title="Post Detail" left={<span>Back</span>} right={<span>...</span>} />
            <div style={{ flex: 1, overflowY: 'auto', padding: spacing.md }}>
              <Card style={{ marginBottom: spacing.md }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
                  <Avatar name="Vincent" />
                  <div>
                    <div style={{ fontWeight: typography.weights.bold }}>Vincent</div>
                    <div style={{ fontSize: typography.sizes.xs, color: colors.textTertiary }}>2 hours ago · Beijing</div>
                  </div>
                </div>
                <h3 style={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, marginBottom: spacing.sm }}>Looking for a Co-Founder!</h3>
                <p style={{ lineHeight: 1.6, color: colors.textSecondary, marginBottom: spacing.md }}>
                  We are building the next generation AI design tool. Looking for a technical co-founder with React and Python experience.
                </p>
                <div style={{ display: 'flex', gap: spacing.sm }}>
                  <Tag label="Startup" color="blue" />
                  <Tag label="AI" color="purple" />
                  <Tag label="Hiring" color="green" />
                </div>
              </Card>
              
              <div style={{ marginBottom: spacing.md }}>
                <h4 style={{ marginBottom: spacing.sm }}>Comments</h4>
                <CommentItem
                  avatar={<Avatar name="Alice" />}
                  name="Alice"
                  time="1h ago"
                  content="This sounds super interesting! Sent you a DM."
                />
                <CommentItem
                  avatar={<Avatar name="Bob" />}
                  name="Bob"
                  time="30m ago"
                  content="Is this remote friendly?"
                  onReply={() => {}}
                >
                   <CommentItem
                    avatar={<Avatar name="Vincent" />}
                    name="Vincent"
                    time="10m ago"
                    content="Yes, we are a remote-first team!"
                    isChild
                  />
                </CommentItem>
              </div>
            </div>
            <div style={{ padding: spacing.md, borderTop: `1px solid ${colors.border}`, display: 'flex', gap: spacing.md }}>
              <Input placeholder="Write a comment..." />
              <Button>Send</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '800px', border: `1px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden', backgroundColor: colors.backgroundSecondary }}>
      <div style={{ width: '200px', backgroundColor: colors.background, borderRight: `1px solid ${colors.border}`, padding: spacing.md }}>
        <h3 style={{ marginBottom: spacing.lg }}>Screens</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          <Button variant={activeTab === 'message' ? 'primary' : 'ghost'} onClick={() => setActiveTab('message')} style={{ justifyContent: 'flex-start' }}>Messages</Button>
          <Button variant={activeTab === 'role' ? 'primary' : 'ghost'} onClick={() => setActiveTab('role')} style={{ justifyContent: 'flex-start' }}>Role Select</Button>
          <Button variant={activeTab === 'post' ? 'primary' : 'ghost'} onClick={() => setActiveTab('post')} style={{ justifyContent: 'flex-start' }}>Post Detail</Button>
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
          {renderScreen()}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [view, setView] = useState('components');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.backgroundSecondary }}>
      <div style={{ backgroundColor: colors.background, padding: spacing.md, borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'center', gap: spacing.md }}>
        <Button variant={view === 'components' ? 'primary' : 'secondary'} onClick={() => setView('components')}>Component Library</Button>
        <Button variant={view === 'screens' ? 'primary' : 'secondary'} onClick={() => setView('screens')}>Screen Previews</Button>
      </div>
      
      {view === 'components' ? <ComponentShowcase /> : (
        <div style={{ padding: spacing.xl, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '1000px' }}>
            <ScreenPreview />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
