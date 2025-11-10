'use client'

import { useState, useEffect } from 'react'
import { Award, Gift, Users, TrendingUp, Star, Crown, Zap, Heart, Target, Percent, ChevronRight, Trophy, Sparkles } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { customerApi } from '@/lib/tauri'
import type { Customer } from '@/lib/types'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface LoyaltyStats {
  totalMembers: number
  activeMembers: number
  totalPointsIssued: number
  totalPointsRedeemed: number
  averageLifetimeValue: number
  retentionRate: number
}

interface TierConfig {
  name: string
  color: string
  bgColor: string
  icon: any
  minPoints: number
  benefits: string[]
  pointsMultiplier: number
  discount: number
}

interface Reward {
  id: string
  name: string
  description: string
  pointsCost: number
  value: number
  category: 'discount' | 'free_service' | 'gift' | 'upgrade'
  icon: any
  available: boolean
}

interface Promotion {
  id: string
  title: string
  description: string
  type: 'bonus_points' | 'discount' | 'free_service'
  value: number
  startDate: string
  endDate: string
  active: boolean
}

const TIER_CONFIGS: Record<string, TierConfig> = {
  bronze: {
    name: 'Bronze',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: Award,
    minPoints: 0,
    benefits: ['Earn 1 point per ₹10 spent', 'Birthday bonus: 50 points', 'Member-only promotions'],
    pointsMultiplier: 1,
    discount: 0,
  },
  silver: {
    name: 'Silver',
    color: 'text-gray-700',
    bgColor: 'bg-gray-300',
    icon: Star,
    minPoints: 500,
    benefits: ['Earn 1.2 points per ₹10 spent', '5% discount on all services', 'Birthday bonus: 100 points', 'Priority customer service'],
    pointsMultiplier: 1.2,
    discount: 5,
  },
  gold: {
    name: 'Gold',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: Crown,
    minPoints: 1500,
    benefits: ['Earn 1.5 points per ₹10 spent', '10% discount on all services', 'Birthday bonus: 200 points', 'Free express service monthly', 'Priority pickup/delivery'],
    pointsMultiplier: 1.5,
    discount: 10,
  },
  platinum: {
    name: 'Platinum',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: Trophy,
    minPoints: 3000,
    benefits: ['Earn 2 points per ₹10 spent', '15% discount on all services', 'Birthday bonus: 500 points', 'Free express service unlimited', 'VIP pickup/delivery', 'Exclusive member events'],
    pointsMultiplier: 2,
    discount: 15,
  },
}

const REWARDS: Reward[] = [
  {
    id: '1',
    name: '₹100 Discount',
    description: 'Get ₹100 off on your next order',
    pointsCost: 500,
    value: 100,
    category: 'discount',
    icon: Percent,
    available: true,
  },
  {
    id: '2',
    name: '₹250 Discount',
    description: 'Get ₹250 off on your next order',
    pointsCost: 1200,
    value: 250,
    category: 'discount',
    icon: Percent,
    available: true,
  },
  {
    id: '3',
    name: 'Free Dry Cleaning',
    description: 'One free dry cleaning service (up to 3 items)',
    pointsCost: 800,
    value: 300,
    category: 'free_service',
    icon: Gift,
    available: true,
  },
  {
    id: '4',
    name: 'Express Service Upgrade',
    description: 'Free upgrade to express service on next order',
    pointsCost: 400,
    value: 150,
    category: 'upgrade',
    icon: Zap,
    available: true,
  },
  {
    id: '5',
    name: '₹500 Discount',
    description: 'Get ₹500 off on your next order',
    pointsCost: 2500,
    value: 500,
    category: 'discount',
    icon: Percent,
    available: true,
  },
  {
    id: '6',
    name: 'Premium Gift Hamper',
    description: 'Luxury laundry care products gift set',
    pointsCost: 3000,
    value: 1000,
    category: 'gift',
    icon: Gift,
    available: true,
  },
]

function LoyaltyContent() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<LoyaltyStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalPointsIssued: 0,
    totalPointsRedeemed: 0,
    averageLifetimeValue: 0,
    retentionRate: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const customersData = await customerApi.getAll()
      setCustomers(customersData)
      calculateStats(customersData)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load loyalty data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (customersData: Customer[]) => {
    const totalMembers = customersData.length
    const activeMembers = customersData.filter(c => c.loyaltyPoints > 0).length
    const totalPointsIssued = customersData.reduce((sum, c) => sum + c.loyaltyPoints, 0)
    const totalPointsRedeemed = 0 // Would come from redemption history
    const averageLifetimeValue = totalMembers > 0
      ? customersData.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / totalMembers
      : 0
    const retentionRate = totalMembers > 0
      ? (customersData.filter(c => (c.totalSpent || 0) > 500).length / totalMembers) * 100
      : 0

    setStats({
      totalMembers,
      activeMembers,
      totalPointsIssued,
      totalPointsRedeemed,
      averageLifetimeValue,
      retentionRate,
    })
  }

  const getTierDistribution = () => {
    const distribution = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    }

    customers.forEach(customer => {
      const points = customer.loyaltyPoints
      if (points >= 3000) distribution.platinum++
      else if (points >= 1500) distribution.gold++
      else if (points >= 500) distribution.silver++
      else distribution.bronze++
    })

    return distribution
  }

  const getTopMembers = () => {
    return [...customers]
      .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
      .slice(0, 10)
  }

  const tierDistribution = getTierDistribution()
  const topMembers = getTopMembers()

  const handleRedeemReward = (reward: Reward) => {
    toast.success(`Reward "${reward.name}" redemption initiated!`)
    // In real implementation, this would deduct points and apply reward
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading loyalty program...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loyalty & Rewards</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your customer loyalty program and rewards
            </p>
          </div>
          <Button>
            <Sparkles className="w-4 h-4 mr-2" />
            Create Promotion
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalMembers}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.activeMembers} active</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Points Issued</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalPointsIssued.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.totalPointsRedeemed.toLocaleString()} redeemed</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Lifetime Value</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.averageLifetimeValue)}</p>
                  <p className="text-xs text-gray-500 mt-1">Per customer</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Retention Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.retentionRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500 mt-1">Customer loyalty</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Heart className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Membership Tiers */}
        <Card>
          <CardHeader>
            <CardTitle>Membership Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(TIER_CONFIGS).map(([key, tier]) => {
                const Icon = tier.icon
                const count = tierDistribution[key as keyof typeof tierDistribution]
                return (
                  <div
                    key={key}
                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${tier.bgColor}`}>
                        <Icon className={`w-6 h-6 ${tier.color}`} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${tier.color}`}>{tier.name}</h3>
                        <p className="text-xs text-gray-500">{tier.minPoints}+ points</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Members</span>
                        <span className="font-bold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${tier.bgColor.replace('100', '500')}`}
                          style={{ width: `${stats.totalMembers > 0 ? (count / stats.totalMembers) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {tier.benefits.slice(0, 3).map((benefit, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs text-gray-600">
                          <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-gray-400" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rewards Catalog */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Rewards Catalog
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {REWARDS.map((reward) => {
                  const Icon = reward.icon
                  return (
                    <div
                      key={reward.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900">{reward.name}</h4>
                        <p className="text-xs text-gray-600 mt-0.5">{reward.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs font-medium text-blue-600">
                            {reward.pointsCost} points
                          </span>
                          <span className="text-xs text-gray-500">
                            Value: {formatCurrency(reward.value)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRedeemReward(reward)}
                        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Top Loyalty Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topMembers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No members yet</p>
              ) : (
                <div className="space-y-3">
                  {topMembers.map((member, index) => {
                    const tier = member.loyaltyPoints >= 3000 ? 'platinum' :
                                member.loyaltyPoints >= 1500 ? 'gold' :
                                member.loyaltyPoints >= 500 ? 'silver' : 'bronze'
                    const tierConfig = TIER_CONFIGS[tier]
                    const TierIcon = tierConfig.icon

                    return (
                      <Link
                        key={member.id}
                        href={`/customers/${member.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900">{member.name}</h4>
                          <p className="text-xs text-gray-600">{member.phone}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className={`p-1.5 rounded ${tierConfig.bgColor}`}>
                            <TierIcon className={`w-4 h-4 ${tierConfig.color}`} />
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{member.loyaltyPoints}</p>
                            <p className="text-xs text-gray-500">points</p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-purple-100 rounded-full">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-900 mb-3">
                  How the Loyalty Program Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">Earning Points:</h4>
                    <ul className="space-y-1.5 text-sm text-purple-800">
                      <li>• Earn points on every purchase (1-2 points per ₹10)</li>
                      <li>• Bonus points on birthdays (50-500 points)</li>
                      <li>• Double points during special promotions</li>
                      <li>• Referral bonuses (100 points per referral)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">Redeeming Rewards:</h4>
                    <ul className="space-y-1.5 text-sm text-purple-800">
                      <li>• Redeem points for discounts and services</li>
                      <li>• Higher tiers unlock better rewards</li>
                      <li>• Points never expire for active members</li>
                      <li>• Instant redemption at checkout</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                  <p className="text-xs text-purple-800">
                    💡 <strong>Pro Tip:</strong> Encourage customers to reach the next tier by showing them how many points they need. Silver tier members spend 30% more on average!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Progression Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(TIER_CONFIGS).map(([key, tier]) => {
                const count = tierDistribution[key as keyof typeof tierDistribution]
                const percentage = stats.totalMembers > 0 ? (count / stats.totalMembers) * 100 : 0
                const Icon = tier.icon

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${tier.bgColor}`}>
                          <Icon className={`w-4 h-4 ${tier.color}`} />
                        </div>
                        <span className={`text-sm font-semibold ${tier.color}`}>
                          {tier.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({tier.minPoints}+ points)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${tier.bgColor.replace('100', '500')} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default function LoyaltyPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <LoyaltyContent />
    </ProtectedRoute>
  )
}
