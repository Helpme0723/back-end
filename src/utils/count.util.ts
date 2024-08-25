export const calculateInsightCount = (newInsight, existingInsight) => {
  let viewCount = newInsight?.viewCount || 0;
  let likeCount = newInsight?.likeCount || 0;
  let commentCount = newInsight?.commentCount || 0;
  let salesCount = newInsight?.salesCount || 0;

  if (existingInsight) {
    viewCount -= existingInsight.totalViews;
    likeCount -= existingInsight.totalLikes;
    commentCount -= existingInsight.totalComments;
    salesCount -= existingInsight.totalSales;
  }

  return {
    viewCount,
    likeCount,
    commentCount,
    salesCount,
  };
};
