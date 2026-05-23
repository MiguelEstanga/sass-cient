import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Check,
  AlertCircle,
  Info,
  Loader2,
  LogOut,
  User,
  Users,
  LayoutDashboard,
  UserCircle,
  Scissors,
  Globe,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Filter,
  MoreHorizontal,
  MoreVertical,
  type LucideProps,
  Clock
} from "lucide-react";

const iconMap = {
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  search: Search,
  plus: Plus,
  edit: Pencil,
  trash: Trash2,
  eye: Eye,
  eyeOff: EyeOff,
  close: X,
  check: Check,
  alertCircle: AlertCircle,
  info: Info,
  loader: Loader2,
  logOut: LogOut,
  user: User,
  users: Users,
  dashboard: LayoutDashboard,
  userCircle: UserCircle,
  scissors: Scissors,
  globe: Globe,
  calendar: Calendar,
  phone: Phone,
  mail: Mail,
  mapPin: MapPin,
  fileText: FileText,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  filter: Filter,
  moreHorizontal: MoreHorizontal,
  moreVertical: MoreVertical,
  Clock: Clock,
} as const;

export type IconName = keyof typeof iconMap;

interface IconProps extends LucideProps {
  name: IconName;
}

export function Icon({ name, size = 16, ...props }: IconProps) {
  const LucideIcon = iconMap[name];
  return <LucideIcon size={size} {...props} />;
}