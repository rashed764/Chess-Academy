import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-12">
      <EmptyState
        icon={<Compass className="w-6 h-6" />}
        title="Unknown Academy Position (404)"
        description="The requested chess route does not exist in the curriculum tree."
        action={
          <NavLink to="/">
            <Button variant="primary" size="sm">
              Return to Academy Hub
            </Button>
          </NavLink>
        }
      />
    </div>
  );
};
