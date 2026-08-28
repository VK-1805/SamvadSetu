import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../utils';

export default function VoteControl({
  upvotes = 0,
  downvotes = 0,
  userVote = 0, // 1 = upvoted, -1 = downvoted, 0 = none
  onVote,
  vertical = true,
  size = 'md',
  disabled = false,
}) {
  const [animating, setAnimating] = useState(null);

  const score = upvotes - downvotes;

  const handleVote = (voteType) => {
    if (disabled) return;
    setAnimating(voteType);
    setTimeout(() => setAnimating(null), 300);

    if (userVote === voteType) {
      onVote?.(0); // Remove vote
    } else {
      onVote?.(voteType);
    }
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const btnSize = size === 'sm' ? 'p-1' : 'p-1.5';

  return (
    <div
      className={cn(
        'flex items-center gap-0.5',
        vertical ? 'flex-col' : 'flex-row',
      )}
    >
      <button
        onClick={() => handleVote(1)}
        disabled={disabled}
        className={cn(
          'rounded-lg transition-all duration-200',
          btnSize,
          userVote === 1
            ? 'text-primary bg-primary-50 hover:bg-primary-100'
            : 'text-text-muted hover:text-primary hover:bg-primary-50',
          animating === 1 && 'scale-125',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label="Upvote"
        title="Upvote"
      >
        <ChevronUp className={cn(iconSize, userVote === 1 && 'stroke-[3]')} />
      </button>

      <span
        className={cn(
          'font-semibold tabular-nums min-w-[2ch] text-center',
          size === 'sm' ? 'text-body-sm' : 'text-body',
          score > 0 ? 'text-primary' : score < 0 ? 'text-danger' : 'text-text-muted'
        )}
      >
        {score}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={disabled}
        className={cn(
          'rounded-lg transition-all duration-200',
          btnSize,
          userVote === -1
            ? 'text-danger bg-danger-light hover:bg-red-100'
            : 'text-text-muted hover:text-danger hover:bg-danger-light',
          animating === -1 && 'scale-125',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label="Downvote"
        title="Downvote"
      >
        <ChevronDown className={cn(iconSize, userVote === -1 && 'stroke-[3]')} />
      </button>
    </div>
  );
}
